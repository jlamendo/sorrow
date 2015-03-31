var m = require('mathjs')
var otu = require('./otuMapArray.js')


vectorator = function() {
    var _this = this;


_this.extend = function(name, vectorSet, customGenerator) {
    var _this = this;
    if (!vectorSet instanceof Array && typeof vectorSet !== 'string' && typeof vectorSet !== 'function') {
        return new Error('Invalid vector set. Must be an array or a function returning an array')
    } else if (typeof vectorSet == 'function') {
        vectorSet = vectorSet();
    } else if (typeof vectorSet == 'string') {
        vectorSet = [vectorSet];
    }
   // if (_this.tContexts[name] !== undefined) {
   //     _this.tContexts[name] = _this.tContexts[name].extend(vectorSet)
   // } else {
        _this.tContexts[name] = new otu(vectorSet);
  //  }

    if (customGenerator && typeof customGenerator === 'function') {
        _this.methods[name] = function() {
            return customGenerator(_this.tContexts[name].pop())
        }
    } else {
        _this.methods[name] = _this.tContexts[name].pop;
    }
};


_this.rand = function() {
    var _this = this;
    return _this.methods[m.pickRandom(Object.keys(_this.methods))]();
};

_this.load = function(file) {
    var _this = this;
    var vectors = require(file);
    vectors.forEach(function(set, i) {
        var customGenerator = null;
            if (set.customGenerator && typeof set.customGenerator === 'function') {
                customGenerator = set.customGenerator
            }
            _this.extend(set.identifier, set.payloads, customGenerator);
    })
}

    _this.methodOverrides = _this.methodOverrides || {};
    _this.tContexts = _this.tContexts || {};
    _this.methods = _this.methods || {};
    _this.load('./vectors.js')



}

module.exports = new vectorator();