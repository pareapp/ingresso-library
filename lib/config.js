'use strict';

var configData = require('../config.json');

/**
 * Config Module exports as singleton object
 * @public
 */
var Config;
module.exports = Config =  (function () {
    var instance;

    function createInstance() {
        var object = new Object();
        object.data = configData;
        return object;
    }

    return {
        getInstance: function () {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();
