var vectorator = require('./vectorator.js');
var Surku = require('./Surku.js');
var wordList = require('./wordlist.js');

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
    setSeed : function(val) {
      z = seed = val || Math.round(Math.random() * m);
    },
    getSeed : function() {
      return seed;
    },
    rand : function() {
      // define the recurrence relationship
      z = (a * z + c) % m;
      // return a float in [0, 1) 
      // if z = m then z / m = 0 therefore (z % m) / m < 1 always
      return z / m;
    }
  };
}());
lcg.setSeed(new Date().getTime());

var sorrowSync = {
};
var sorrow = {};

function createRandomObj(fieldCount, allowNested, nestedCount)
{
	fieldCount = fieldCount || randomInt(10);
	allowNested = allowNested || true;
	nestedCount = nestedCount || 0;
	if(nestedCount > 1){
		allowNested = false;
	} else {
		allowNested = allowNested || true;
	}
    var generatedObj = {};

    for(var i = 0; i < fieldCount; i++) {
        var generatedObjField;

        switch(randomInt(allowNested ? 6 : 5)) {

            case 0:
            generatedObjField = lcg.rand();
            break;

            case 1:
            generatedObjField = lcg.rand() + Math.random();
            break;

            case 2:
            generatedObjField = sorrowSync.bool;
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

// helper functions

function randomInt(rightBound)
{
    return Math.floor(Math.random() * rightBound);
}


var mutate = {
        string: (function() {
            return new Surku();
        })(),
        number: (function() {
            return new Surku();
        })(),
        date: (function() {
            return new Surku();
        })(),
        binary: (function() {
            return new Surku();
        })(),
        object: (function() {
            return new Surku();
        })(),
        any: (function() {
            return new Surku();
        })(),
        array: (function() {
            return new Surku();
        })(),
        bool: (function() {
            return new Surku();
        })(),
    };


Object.defineProperties(sorrowSync, {
  "string": {
    enumerable: true,
    get:function() {
    	var b = vectorator.rand();
      while(b === undefined){
        b = vectorator.rand();
      }
      return b;
	},
  }, "number": {
    enumerable: true,
    get:function() {
    	return mutate.number.generateTestCase(String(lcg.rand()));
	},
  },  "date": {
    enumerable: true,
    get:function() {
    	var seedVal = lcg.rand();
    	var currEpoch = new Date().getTime();
    	while(seedVal > currEpoch * 1.2){
    		seedVal = seedVal * Math.random();
    	}

	return mutate.date.generateTestCase(
		new Date(
			Math.random() * (
				Math.max(currEpoch - seedVal, 0)
				)
			).toString()
		);
	},
  },  "binary": {
    enumerable: true,
    get:function() {
    	return mutate.binary.generateTestCase(new Buffer(Math.floor(Math.random() * (500 - 10 + 1)) + 10)).toString();
	},
  },  "object": {
    enumerable: true,
    get:function() {
    	return createRandomObj();
	},
  },  "bool": {
    enumerable: true,
    get:function() {
    	return ['true', 'false', 1, 0][Math.floor(Math.random()*3)];
	},
  },  "any": {
    enumerable: true,
    get:function() {
    	return sorrowSync[['string','number','date','binary','object','bool','array'][Math.floor(Math.random() * 6)]];

	},
  },  "array": {
    enumerable: true,
    get:function() {
    	var retVal = [];
    	var len = randomInt(20);
    	for(var i = 0; i< len; i++){
    		retVal.push(sorrowSync[['string','number','date','binary','object','bool'][Math.floor(Math.random() * 5)]]);
    	}
    	return retVal;
	},
  },
});

var parseArgs = function(){


};
var sorrowAsync = {
  "string":function(seed, cb) {
        vectorator.rand();
  }, "number":function(seed, cb) {
        mutate.number.generateTestCase(String(lcg.rand()));
  },  "date":function(seed, cb) {
      var seedVal = lcg.rand();
      var currEpoch = new Date().getTime();
      while(seedVal > currEpoch * 1.2){
        seedVal = seedVal * Math.random();
      }

  return mutate.date.generateTestCase(
    new Date(
      Math.random() * (
        Math.max(currEpoch - seedVal, 0)
        )
      ).toString()
    );
  },  "binary": function(seed, cb) {
        mutate.binary.generateTestCase(new Buffer(Math.floor(Math.random() * (500 - 10 + 1)) + 10)).toString();
  },  "object":function(seed, cb) {
        createRandomObj();
  },  "bool":function(seed, cb) {
        ['true', 'false', 1, 0][Math.floor(Math.random()*3)];
  },  "any":function(seed, cb) {
        sorrowSync[['string','number','date','binary','object','bool','array'][Math.floor(Math.random() * 6)]];
  },  "array":function(seed, cb) {
      var retVal = [];
      var len = randomInt(20);
      for(var i = 0; i< len; i++){
        retVal.push(sorrowSync[['string','number','date','binary','object','bool'][Math.floor(Math.random() * 5)]]);
      }
      return retVal;
  },
  // etc. etc.
};


module.exports = sorrowSync;