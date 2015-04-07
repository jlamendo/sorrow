var vectorator = require('./vectorator.js');
var wordList = require('./wordlist.js');
var mjs = require('mathjs');
var surku = require('./surkuWrapper.js')

var objectMutator = function(o, immutableProperties, rCount){
    rCount = rCount || 0;
    var build, key, destKey, ix, value;

    build = {};
    for (key in o) {
        // Get the destination key
        if(!immutableProperties || immutableProperties.indexOf(key) !== -1){
        // Get the value

        // If this is an object, recurse
        if (typeof o[key] === "object" || o[key] === "object" && rCount <=2) {
            build[key] = objectMutator(o[key], rCount++);
        } else {

        var types = ['string','date','number', 'boolean', 'binary']
        if(types.indexOf(o[key]) === -1){
        var type = types.indexOf(typeof o[key]);
        if (type === -1) {
            type = 0;
        };
        type = types[type];
        // Set it on the result using the destination key
        build[key] = sorrowAsync[type](o[key]);
      } else {
        type = o[key];
          build[key] = sorrowSync[type];
      }
    }
    }
}
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
      return function(seed){
        return (seed !== null && seed !== undefined)? surku['string'](seed) : vectorator.rand()
      }
    })(),
    number: (function() {
      return function(seed){
        return (seed !== null && seed !== undefined)? surku['number'](String(seed)) : surku['number'](String(lcg.rand()))
      }
    })(),
    date: (function() {
        return function(seed) {
            if (seed !== null && seed !== undefined) {
              return surku['date'](seed)
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
      return function(seed){
          return (seed !== null && seed !== undefined)? surku['binary'](seed) : surku['binary'](
            new Buffer(Math.floor(Math.random() * (500 - 10 + 1)) + 10)
            ).toString()
        }
    })(),
      object: (function() {
      return function(seed){
          return (seed !== null && seed !== undefined)? objectMutator(seed) :  createRandomObj();
        }
    })(),
      any: (function() {
      return function(seed){
          return sorrowSync[mjs.pickRandom(['string', 'number', 'date', 'binary', 'object', 'boolean', 'array'])];
      }
    })(),
      array: (function() {
      return function(seed){
        if(seed !== null && seed !== undefined){
          var retVal = [];
          var len = seed.length;
          for (var i = 0; i < len; i++) {
            type = typeof seed[i]
            type = (type === 'object'|| type === 'array')? 'string': type;
            retVal.push(sorrowAsync[type](seed[i]));
          }
          return retVal;
        } else {
          var retVal = [];
          var len = mjs.randomInt(20);
          for (var i = 0; i < len; i++) {
            retVal.push(sorrowSync[mjs.pickRandom(['string', 'number', 'date', 'binary', 'object', 'boolean'])]);
          }
          return retVal;
        }
      }
    })(),
      boolean: (function() {
      
      return function(seed){
          return (seed !== null && seed !== undefined)? surku['boolean'](seed) : mjs.pickRandom(['true', 'false', 1, 0]);
        }
    })(),
    };


    Object.defineProperties(sorrowSync, {
      "string": {
        enumerable: true,
        get: function() {
          var b = vectorator.rand();
          while (b === undefined) {
            b = vectorator.rand();
          }
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
      return function(seed, cb) {
        var payload;
        seed = (typeof seed !== 'object' && typeof seed !== 'array')? seed.toString(): seed
        payload = mutate[type]((seed !== null && seed !== undefined)? seed: undefined);
        if (!cb || typeof cb !== 'function') {
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