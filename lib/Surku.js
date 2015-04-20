
var log = function(){};
var ensureMinMax = function(input, defaults){
    if (!defaults || typeof defaults !== 'object' ) {
        return new Error("otuMapArray.js:ensureMinMax: No defaults object provided.")
    }
    if (!input || typeof input !== 'object' || (!input.max && !input.min)) {
        return { max: defaults.maxDefault, min:defaults.minDefault };
    }
    return {
        max : Math.max(Math.min(input.max || defaults.maxDefault , defaults.maxLimit), Math.max(input.min || defaults.minDefault, defaults.minLimit)),
        min : Math.min(Math.max(input.min || defaults.minDefault, defaults.minLimit), Math.max(input.max || defaults.minDefault, defaults.minLimit))
    }

}

//var fs 		 = require('fs');
var Surku = function (user_config){
	this.m 		  = require('./mersenne-twister.js')
	this.mutators = require('./mutators.js')
	var self=this
	var stringCheckRegExp=/[\u0000-\u0005]+/
	this.config={
		maxMutations:20,
		minMutations:1,
		useOnly: undefined,
		seed: undefined,
		verbose: undefined,
		defaults: {
			mutations: {minDefault: 5, maxDefault: 10, minLimit: 1, maxLimit: 20},
			lengths: {minDefault: 100, maxDefault: 1000, minLimit: 1, maxLimit: 10000},
		}
	}

	if(user_config !== undefined){
		for(var key in user_config)
			this.config[key]=user_config[key]
	}
	
	if(this.config.useOnly!==undefined && this.config.useOnly instanceof Array){
		this.mutators.useOnlyMutators(this.config.useOnly)
	}

	this.ra=function (array){
		if(array)
			return array[this.rint(array.length)]
		else
			return false
	}

	this.rint=function (max){
		var rintOutput=Math.floor(this.r.genrand_real1()*max)
		return rintOutput
	}

	this.wrint=function(max){
		if(max===undefined)
			max=2000
		var num=this.r.genrand_real1()*3
		var div=this.r.genrand_real1()+Number.MIN_VALUE //Avoid divide by zero.
		return (Math.floor((num/div)) ? Math.floor((num/div)) : 1) % max
	}
	var seedBase  = this.m.newMersenneTwister(self.config.seed)
	this.seedBase=seedBase

	this.generateTestCase=function(input, opts){
		var testCase;
		this.config=self.config;
		this.storage=self.storage;
		this.ra=self.ra;

		this.rint=self.rint;
		
		this.r=self.m.newMersenneTwister(seedBase.genrand_int31());

		if(input instanceof Buffer){
			input=new Buffer((mutate.call(this,input.toString('binary'), opts)),'binary');
			return input
		}
		else if(input instanceof String || typeof(input)=='string'){
			return mutate.call(this,input, opts);
		}
		else{
			log("Wrong input format. Must be String or Buffer!")
		}
		
	}
	
	// TODO: Implement Neural NEtworking stuff here
	//Hold kind of linked list of stored data
	//
	/*	
		storage:{
			where:[
				[key1,key2],
				[[key1value1,key1value2],key2valueq]
			]	
		} 
	*/
	this.storage={
		maxKeys:400,
		maxValues:50,
		valueStorages:{},
		storeKeyValuePair:function(keyValueArray,where){
			//Check if valueStorage name was provided
			if(where===undefined)
				where='defaultStorage'
			//If valueStorage named with value of where exists use it, else create empty one.
			if(this.valueStorages.hasOwnProperty(where))
				var storageObject=this.valueStorages[where]
			else{
				this.valueStorages[where]=[[],[]]
				var storageObject=this.valueStorages[where]
			}
			//Check that keyValueArray is an Array with length 2 so that storage will stay in sync.	
			if((keyValueArray instanceof Array) && keyValueArray.length==2){
				//Look from valueStorage[where] if key exists, if it does save into keys index on values array.
				//Check that size of storage is not exceeded from unshift return value.
				var index=storageObject[0].indexOf(keyValueArray[0])
				if(index!=-1){
					if(storageObject[1][index].unshift(keyValueArray[1])>this.maxValues){
						storageObject[1][index].pop()
					}
				}
				else{
					if(storageObject[0].unshift(keyValueArray[0])>this.maxKeys){
						storageObject[0].pop();
						storageObject[1].pop();
					}
					storageObject[1].unshift([keyValueArray[1]])
				}
			}
			else{
				log('Invalid input to storeKeyValue. Must be Array [key,value] got '+keyValueArray)
			}
		},
		getValueForKey:function(key,where){
			if(where===undefined)
				where='defaultStorage'	
			if(this.valueStorages.hasOwnProperty(where))
				var storageObject=this.valueStorages[where]
			else
				return false
			var index=storageObject[0].indexOf(key)
			if(index!=-1)
				return self.ra(storageObject[1][index])
			else 
				return false
		}
	}

	//
	//mutate(input)
	//input: Data to be mutated
	//
	//
	//
	function mutate(input, opts){	
		if(input.length!=0){
			opts=opts||{};
			var lenOpts = ensureMinMax({
				min: opts.min,
				max: opts.max
			}, this.config.defaults.lengths);
			var mutOpts = ensureMinMax({
				min: opts.maxMutations,
				max: opts.minMutations,
			}, this.config.defaults.mutations)
			var mutationCount = 0;
			var forceRE
			if(mutOpts.min === mutOpts.max)	
				var mutations = mutOpts.max;
			else
				var mutations = this.rint(mutOpts.max-mutOpts.min)+mutOpts.min
				lenOpts.trim = this.rint(lenOpts.max-lenOpts.min)+lenOpts.min
				var startMutations
			while(mutations > 0){
					var index=0;
					if(input.length >= lenOpts.max && startMutations !== mutations){
						input = input.substring(0, lenOpts.max);
						mutations=0;
						break;
					} else {
						var mutator=this.ra(this.mutators.mutators)
						var isString = !stringCheckRegExp.test(input)
						result=(mutator.call(this,input,isString))
						if(result !== false){
							mutations --;
							input = input+result;	
							if(input.length >= lenOpts.min){
								if(input.length >= lenOpts.max || mutationCount >= mutOpts.max){
									input = input.substring(0, lenOpts.trim);
									mutations=0;
									break;
								}
							}
					} else {
								mutations ++;
							}
				}
			}

			return input
		}
		else{
			console.error('Mutate Error: Zero-sized input.');
			return input
		}
	}
	return this
}	

	module.exports=Surku
