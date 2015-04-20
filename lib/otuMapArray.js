'use strict';
var ensureMinMax = function(input, defaults){
    if (!defaults || typeof defaults !== 'object' ) {
        return new Error("otuMapArray.js:ensureMinMax: No defaults object provided.")
    }
    if (!input || typeof input !== 'object' || (!input.max && !input.min)) {
        return { max: defaults.max, min:defaults.min };
    }
    return {
        max : Math.max(Math.min(input.max || defaults.max , defaults.max), Math.max(input.min || defaults.min, defaults.min)),
        min : Math.min(Math.max(input.min || defaults.min, defaults.min), Math.max(input.max || defaults.min, defaults.min))
    }

}

var wu = require('./wu.js');
var randy = require('randy');
var lru = require('simple-lru-cache');

var filts = { max: wu.curryable(function (len, el) {
        return el.length <= len;
    }),
    min: wu.curryable(function (len, el) {
        return el.length >= len;
    }),
    minmax: wu.curryable(function (len, el) { 
        return ((el.length >= len.min) && (el.length <= len.max)) 
    }),
    compile: function compile(type, test) {
        return wu.filter(filts[type](test));
    }
};
function getConf(ar) {
        ar = ar || [];
        var s = ar.sort(function (a, b) {
            return a.length - b.length;
        });
        return [s,{ min: s[0].length, max: s[s.length - 1].length, total: s.length }];
    };


var cache = function cache(array) {
    var tmp = getConf(array);
    this.limits=tmp.pop();
    this.data = tmp.pop();
    this.lru = new lru({ maxSize: 1000 });
    return this;
};

cache.prototype.pop = function (opts) {
    //var _this = this;
    opts = opts || {};
    var trimMax = opts.max || false;
    if(this.lru === undefined){
        this.lru = new lru({ maxSize: 1000 });
    }
    opts = ensureMinMax(opts, this.limits);
    var filterSetId = JSON.stringify(opts);
    var rangeInCache = this.lru.get(filterSetId);
   // console.log({limits: this.limits, opts:opts, filterSetId: filterSetId, rangeInCache: rangeInCache})
    if (rangeInCache !== undefined) {
        retVal = rangeInCache.pop();
        this.lru.set(filterSetId, rangeInCache);
        if(trimMax && retVal.length > trimMax){
            return retVal.substring(0,trimMax);
        } else return retVal;
    } else {
        var findInRange = filts.compile("minmax", opts);
        var elementsInRange = Array.from(findInRange(wu(this.data)));
        var rangeToCache = new otuMapArray(elementsInRange);
        var retVal = rangeToCache.pop();
        this.lru.set(filterSetId, rangeToCache);
        if(trimMax && retVal.length > trimMax){
            return retVal.substring(0,trimMax);
        } else return retVal;
    }
};
//cache.prototype.pop = cache.prototype.retrieve;

var otuMapArray = function otuMapArray(data) {
    this.data = data;
    this.len = this.data.length;
    this.data[this.len] = [];

    for (var i = 0; i < this.len; i++) {
        this.data[this.len].push(i);
    }

    this.reset = function () {
        var _this = this;
        if (!this.data[this.len]) {
            this.data[this.len] = [];
        }
        for (var i = 0; i < this.len; i++) {
            this.data[this.len].push(i);
        }
    };

    this.pop = function () {
        var _this = this;
        var index = this.rng(this.data[this.len].length);
        return this.data[this.data[this.len].splice(index, 1)];
    };

    this.rng = function (range) {
        var _this = this;
        if (range === 0) this.reset();
        return randy.randInt(range);
    };
};
//mkTest=function(len){var y=[];for(var i=0; i<len; i++){y[i]= new Array(i).join().replace(/(.|$)/g, function(){return ((Math.random()*36)|0).toString(36)[Math.random()<.5?"toString":"toUpperCase"]();});} return new cache(y);}

module.exports = cache;
