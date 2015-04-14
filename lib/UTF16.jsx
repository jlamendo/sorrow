var wu = require('./wu.js')
var randy = require('randy');


function rand() {
  var seed = randy.randInt(100000000)
  // To make the test results predictable, we use a 100% deterministic
  // alternative.
  // Robert Jenkins' 32 bit integer hash function.
  seed = ((seed + 0x7ed55d16) + (seed << 12))  & 0xffffffff;
  seed = ((seed ^ 0xc761c23c) ^ (seed >>> 19)) & 0xffffffff;
  seed = ((seed + 0x165667b1) + (seed << 5))   & 0xffffffff;
  seed = ((seed + 0xd3a2646c) ^ (seed << 9))   & 0xffffffff;
  seed = ((seed + 0xfd7046c5) + (seed << 3))   & 0xffffffff;
  seed = ((seed ^ 0xb55a4f09) ^ (seed >>> 16)) & 0xffffffff;
  return (seed & 0xffff)
}


function RCF(last){
  this.last;
  this.pop = function(){
    this.last = this.calc(this.last);
    return this.last;
  };
  this.seq = function(){
    this.last=rand();
    return this.pop.bind(this);;
  }
}
// Random character.
RCF.prototype.calc = function(last) {
  var c = rand();
  // Increase the concentration of problematic values around the page
  // edges.
  if (rand() & 1) {
    c = (c & 0xff80) + (c & 3) - 2;
  }
  // Increase the concentration of problematic values around the ends.
  if (rand() & 31 == 0) c = 0xfff8 + (rand() & 7)
  if (rand() & 31 == 0) c = (rand() & 7)

  // Increase the concentration of values near each other.
  if (rand() & 1) c = last + (rand() & 15) - 8;
  return c & 0xffff;  // Only code unit values.
}

/*
generate a length between 1 and 16; - believed to be length of one char and not length of string;
iterate length times, doing the following steps:
    set last to a random number;
    push last into an array;
    set 


*/



function UTF16(transformFunc){
  this.transformFunc=transformFunc;
  var fillWith = wu.curryable((fill, el) => fill(el))
      if(this.transformFunc === null      ||
         this.transformFunc === undefined ||
         typeof this.transformFunc !== 'function') {
            this.rcf = new RCF();
            this.fill = this.transformFunc = fillWith(this.rcf.seq());
        } else if(!this.fill){
          this.fill = fillWith(this.transformFunc)
        }

  this.getRange = function(source){
      switch(typeof source){
        case 'object':
          if (!source instanceof wu) source = wu(source);
          break;
        case 'array': 
          source = wu(source);
          break;
        case 'number':
          source = wu.count().take(source);
          break;
        case 'string': 
          source = wu(source.split(''));
          break;
        default:
          source = wu.count().take(rand() & 0x1f);
      }
    return wu.map(this.fill, source)
    }
  }



  var pop = function(opts) {
      if(!opts.max && !opts.min) opts.max=1000;
      opts.max = Math.floor(opts.max/(1.6016216216216217-(opts.max*0.000082)))
      this.compiledText = "";
      var compile = function(el){
        var char = String.fromCharCode(el[0]);
        if (char == '\\' || char == ']') char = '\\' + char;
        var tmp = (el[1] < opts.max - 1 && rand() & 1)? char + '-' : char;
        this.compiledText+=tmp;
        return tmp;
      }.bind(this);
      var UTF_16_Ints = new UTF16();
      var UTF_16_fromInt = new UTF16(compile)
      var ranges = Array.from(UTF_16_Ints.getRange(opts.max)).sort(function (a, b) { return a - b });
      ranges.forEach(function(el,i){
        ranges[i]=[el,i]
      })
      return Array.from(UTF_16_fromInt.getRange(ranges)).join('');
    }


module.exports=pop;

