var m = require('mathjs')
var otu = require('./otuMapArray.js')


var vectorator = function() {
    var _this = this;


_this.extend = function(name, vectorSet, customGenerator, overrideEnabled) {
    var _this = this;
    if(overrideEnabled === true){
        _this.tContexts[name] = vectorSet
    } else {
    if (!vectorSet instanceof Array && typeof vectorSet !== 'string' && typeof vectorSet !== 'function') {
        return new Error('Invalid vector set. Must be an array or a function returning an array')
    } else if (typeof vectorSet == 'function') {
        vectorSet = vectorSet();
    } else if (typeof vectorSet == 'string') {
        vectorSet = [vectorSet];
    }
        _this.tContexts[name] = new otu(vectorSet.sort(function (a, b) {
            return a.length - b.length;
        }), name);

    }
    if (customGenerator && typeof customGenerator === 'function') {
        _this.methods[name] = function() {
            return customGenerator(
                _this.tContexts[name].pop.apply(
                    _this.tContexts[name],
                     Array.prototype.slice.call(arguments)
                     )
                )
        }
    } else {
        _this.methods[name] = function(){
            return _this.tContexts[name].pop.apply(
                _this.tContexts[name],
                Array.prototype.slice.call(arguments)
            );
        }
    }

};


_this.rand = function(opts) {
    var _this = this;
       /* var type = undefined;
        var len = undefined;
        Object.keys(opts).forEach(function(opt){
        switch(opt){
            case "max":
                var type="max";
                var len=opts["max"];
                break;
            case "min":
                var type="min";
                var len=opts["min"];
                break; 
            default:  
            len = 4000;
            type = "max";         
        }
    })*/
     //   console.log(m.pickRandom(Object.keys(_this.methods)), type, len, opts)
        var ctx = m.pickRandom(Object.keys(_this.methods))
        return _this.methods[ctx].apply(_this.tContexts[ctx], [opts]);
};

_this.load = function(file) {
    var _this = this;
    var vectors = require(file);
    vectors.forEach(function(set, i) {
        var customGenerator = null;
            if (set.customGenerator && typeof set.customGenerator === 'function') {
                customGenerator = set.customGenerator
            }
            _this.extend(set.identifier, set.payloads, customGenerator, set['OTU_MAP_ARRAY_OVERRIDE'] || false);
    })
}

    _this.methodOverrides = _this.methodOverrides || {};
    _this.tContexts = _this.tContexts || {};
    _this.methods = _this.methods || {};
    _this.load('./vectors.js')

}

module.exports = new vectorator();