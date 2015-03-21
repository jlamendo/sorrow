var Surku = require('./Surku.js');


var surkuInstances = {};
var surku = {};
['string','number','date','binary', 'boolean'].forEach(function(type){
      surkuInstances[type] =  new Surku();
      surku.__defineGetter__(type, function(){return surkuInstances[type].generateTestCase.bind(surkuInstances[type])});
});

module.exports=surku;