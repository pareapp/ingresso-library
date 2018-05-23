'use strict';

/**
 * Module dependencies.
 * @private
 */

var Events = require('./lib/event');
var Performance = require('./lib/performance');
var Availability = require('./lib/availability');
var Reserve = require('./lib/reserve');
var conf = require('./lib/config');
var configObjDefault = require('./config.json');
var Purchase = require('./lib/purchase');
var Status = require('./lib/status');

/**
 * Module exports.
 * @public
 */

module.exports = Ingresso;

function Ingresso(configObj) {
  var config = conf.getInstance();
  config.data = ((typeof configObj == 'object') &&
                  configObj.hasOwnProperty('user') &&
                  configObj.hasOwnProperty('password') &&
                  configObj.hasOwnProperty('url') ) ?
                  configObj :
                  configObjDefault;
  if (!(this instanceof Ingresso))
    return new Ingresso(configObj);
}

Ingresso.prototype.events =  new Events();

Ingresso.prototype.performance = new Performance();

Ingresso.prototype.availability = new Availability();

Ingresso.prototype.reserve = new Reserve();

Ingresso.prototype.purchase = new Purchase();

Ingresso.prototype.status = new Status();
