require("babel/polyfill");
module.exports = require('./lib');

//TODO:
// Add trim parameter to surku instances. Maybe develop an algorithm to translate that trim parameter into min/max mutations? Would certainlybe more efficient.
// add min/max mutations params to surku instances
// Convert seed object to opts object for passing in config values easily. We'll have more than 3 args at that point, so it's good style.
// upstream all of that to fuzzb.in
// maybe actually use some generic type validators for some things? Sane limits/defaults? might be easiest to introduce defaults at the joi level rather than function level.
// add docs for said changes
// make a quick gulpfile to compile revelant things with babel.