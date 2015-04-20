var vectorator = require('./vectorator.js');
var wordList = require('./wordlist.js');
var mjs = require('mathjs');
var surku = require('./surkuWrapper.js');
var rb = require('crypto').pseudoRandomBytes;
var _type =  require('type-detect');

var parseItem = function(data, globalOpts) {
  var types = ['string','date','number', 'boolean', 'binary'];
  var specialProps = ['_type','_min', '_max','_seed'];
  var type = "string";
  var seed = null;
  var opts = globalOpts || {};
  if (_type(data) === "object"){
    if (data["_immutable"] !== undefined){
      // If we recieve something like {"prop": {"_immutable":"special_value_that_cant_change"}}
      // return {"prop":"special_value_that_cant_change"}
      return { success: true, data: data["_immutable"] };
    } else if( types.indexOf(data["_type"]) !== -1){
      // If there is a _type key on the object, and is an allowed type, consider it an options object.
    seed = data["_seed"] || null;
    type = types.indexOf(data["_type"]);
    type = (type === -1)? "string" : types[type];
    delete data["_seed"];
    delete data["_type"]
    specialProps.forEach(function(opt){
      if(_type(data[opt]) === 'number'){
        opts[opt.replace('_','')]=data[opt];
        }
      })
  } else {
        // If the type is an object, but we still haven't found a matching case yet, it's a standard object - recurse through it.
        return { success: false, recurse: true };
      }
  } else if(_type(data) === "string" && types.indexOf(data) !== -1){
          // If the type of the passed in data is a string, and the value of the string is an allowed type,
          // consider it a request for generative fuzzing data.
          type = types[types.indexOf(data)];
  } else {
          // otherwise it's either an allowed primitive, or going to be forced into a string.
    type = (types.indexOf(_type(data)) !== -1)? _type(data) : "string";
    seed = data;
  }
      return {success: true, data: sorrowAsync[type](seed, opts)};
  }


var objectMutator = function(o, globalOpts, rCount){
  if(Object.keys(o).length === 0){
    return sorrowSync.array;
  }
    rCount = rCount || 0;
    globalOpts = globalOpts || {};
   // var types = ['string','date','number', 'boolean', 'binary'];
   // var specialProps = ['_type','_min', '_max','_seed'];

    build = {};
    for (key in o) {
        var results = parseItem(o[key], globalOpts);
        if(results.success === true){
          build[key] = results.data;
        } else if(results.recurse === true && rCount <= 3){
            build[key] = objectMutator(o[key], globalOpts, rCount++);
        } else {
          build[key] = "Sorrow.js encountered an error while parsing this item. Sorrwy."
        }
        rCount = 0;
}
    return build;

}
var arrayMutator = function(o, globalOpts, rCount){
    if(o.length === 0){
    return sorrowSync.object;
  }
    rCount = rCount || 0;
    globalOpts = globalOpts || {};
   // var types = ['string','date','number', 'boolean', 'binary'];
   // var specialProps = ['_type','_min', '_max','_seed'];

    build = [];
    o.forEach(function(val, i){
        var results = parseItem(val, globalOpts);
        if(results.success === true){
          build[i] = results.data;
        } else if(results.recurse === true && rCount <= 3){
            build[i] = (_type(val) === 'array')? arrayMutator(val, globalOpts, rCount++) : objectMutator(val, globalOpts, rCount++);
        } else {
          build[i] = "Sorrow.js encountered an error while parsing this item. Sorrwy."
        }
        rCount = 0;
})
    return build;

}

var lcg = (function() {
  // Set to values from http://en.wikipedia.org/wiki/Numerical_Recipes
  // m is basically chosen to be large (as it is the max period)
  // and for its relationships to a and c
  var m = 4294967296,
    // a - 1 should be divisible by m's prime factors
    a = 1664525,
    // c and m should be co-prime
    c = 1013904223,
    seed, z;
  return {
    setSeed: function(val) {
      z = seed = val || Math.round(Math.random() * m);
    },
    getSeed: function() {
      return seed;
    },
    rand: function() {
      // define the recurrence relationship
      z = (a * z + c) % m;
      // return a float in [0, 1) 
      // if z = m then z / m = 0 therefore (z % m) / m < 1 always
      return z / m;
    }
  };
}());
lcg.setSeed(new Date().getTime());

var sorrowSync = {};
var sorrow = {};

function createRandomObj(fieldCount, allowNested, nestedCount) {
  fieldCount = fieldCount || mjs.randomInt(10);
  allowNested = allowNested || true;
  nestedCount = nestedCount || 0;
  if (nestedCount > 1) {
    allowNested = false;
  } else {
    allowNested = allowNested || true;
  }
  var generatedObj = {};

  for (var i = 0; i < fieldCount; i++) {
    var generatedObjField;

    switch (mjs.randomInt(allowNested ? 6 : 5)) {

      case 0:
        generatedObjField = lcg.rand();
        break;

      case 1:
        generatedObjField = lcg.rand() + Math.random();
        break;

      case 2:
        generatedObjField = sorrowSync.boolean;
        break;

      case 3:
        generatedObjField = sorrowSync.string;
        break;

      case 4:
        generatedObjField = null;
        break;

      case 5:
        generatedObjField = createRandomObj(fieldCount, allowNested, nestedCount++);
        break;
    }
    generatedObj[wordList.getRandomWord()] = generatedObjField;
  }
  return generatedObj;
}



var mutate = {
    string: (function() {
      return function(seed, opts){
        return (seed !== null && seed !== undefined)? surku['string'](seed, (opts)? opts: undefined) : vectorator.rand((opts)? opts: undefined)
      }
    })(),
    number: (function() {
      return function(seed, opts){
        return (seed !== null && seed !== undefined)? surku['number'](String(seed), (opts)? opts: undefined) : surku['number'](String(lcg.rand()), (opts)? opts: undefined)
      }
    })(),
    date: (function() {
        return function(seed, opts) {
            if (seed !== null && seed !== undefined) {
              return surku['date'](seed, (opts)? opts: undefined)
            } else {
              var seedVal = lcg.rand();
              var currEpoch = new Date().getTime();
              while (seedVal > currEpoch * 1.2) {
                seedVal = seedVal * Math.random();
              }
              return surku['date'](
                new Date(
                  Math.random() * (
                    Math.max(currEpoch - seedVal, 0)
                  )
                ).toString()
              );

            }
          }
        })(),
      binary: (function() {
      return function(seed, opts){
        if(!opts) opts = {};
          return (seed !== null && seed !== undefined)? surku['binary'](seed, opts) : surku['binary'](
            rb(Math.floor(Math.random() * ((opts.max || 500) - (opts.min || 10) + 1)) + (opts.min || 10)), opts
            ).toString()
        }
    })(),
      object: (function() {
      return function(seed, opts){
          return (seed !== null && seed !== undefined)? objectMutator(seed, (opts)? opts: undefined) :  createRandomObj();
        }
    })(),
      any: (function() {
      return function(seed, opts){
          return sorrowSync[mjs.pickRandom(['string', 'number', 'date', 'binary', 'object', 'boolean', 'array'])];
      }
    })(),
      array: (function() {
      return function(seed, opts){
        if(seed !== null && seed !== undefined && _type(seed) === 'array'){ 
            return arrayMutator(seed, opts);
        } else {
          var retVal = [];
          var len = mjs.randomInt(20);
          for (var i = 0; i < len; i++) {
            retVal.push(sorrowAsync[mjs.pickRandom(['string', 'number', 'date', 'binary', 'boolean'])](null, opts));
          }
          return retVal;
        }
      }
    })(),
      boolean: (function() {
      
      return function(seed, opts){
          return (seed !== null && seed !== undefined)? surku['boolean'](seed, (opts)? opts: undefined) : mjs.pickRandom(['true', 'false', 1, 0]);
        }
    })(),
    };


    Object.defineProperties(sorrowSync, {
      "string": {
        enumerable: true,
        get: function() {
          var b = vectorator.rand();
          return b;
        },
      },
      "number": {
        enumerable: true,
        get: mutate.number,
      },
      "date": {
        enumerable: true,
        get: mutate.date,
      },
      "binary": {
        enumerable: true,
        get: mutate.binary,
      },
      "object": {
        enumerable: true,
        get: mutate.object,
      },
      "boolean": {
        enumerable: true,
        get: mutate.boolean,
      },
      "any": {
        enumerable: true,
        get: mutate.any,
      },
      "array": {
        enumerable: true,
        get: mutate.array,
      }
    });


    function asyncify(type) {
      return function(seed, opts, cb) {
        var payload;
        if (!cb && _type(opts)==='function'){
          cb=opts;
          opts={};
        }
        seed = (seed !== null && _type(seed) !== 'object' && _type(seed) !== 'array')? seed.toString() : seed
        payload = mutate[type]((seed !== null && seed !== undefined)? seed: undefined, (opts !== null && opts !== undefined)? opts: undefined);
        if (!cb || _type(cb) !== 'function') {
          return payload;
        } else {
          return cb(payload);
        }
      }
    }

    var sorrowAsync = {
      "string": asyncify('string'),
      "number": asyncify('number'),
      "date": asyncify('date'),
      "binary": asyncify('binary'),
      "object": asyncify('object'),
      "boolean": asyncify('boolean'),
      "any": asyncify('any'),
      "array": asyncify('array'),
      // etc. etc.
    };
    sorrowSync._internals = vectorator
    sorrowSync.async = sorrowAsync;

    module.exports = sorrowSync;