var sorrow = require('./index.js');

function objectMutator(o, immutableProperties){

    var build, key, destKey, ix, value;

    build = {};
    for (key in o) {
        // Get the destination key
        if(!immutableProperties || immutableProperties.indexOf(key) !== -1){
        // Get the value

        // If this is an object, recurse
        if (typeof value === "object") {
            value = objectMutator(value);
        } else {

        var types = ['string','date','number', 'boolean', 'binary']
        var type = types.indexOf(typeof o[key]);
        if (type === -1) {
            type = 0;
        };
        type = types[type];
        // Set it on the result using the destination key
        build[key] = sorrow.async[type](o[key]);
    }
    }
}
    return build;

}
module.exports = objectMutator;