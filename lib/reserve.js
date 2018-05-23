/*!
 * Reserve
 * develop by PRDXN
 *
 *
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */

var request = require('superagent');
var moment = require('moment');
var dataMapping = require('./data-mapping.json');
var conf = require('./config');
var config = conf.getInstance();

/**
 * Module exports.
 * @public
 */

module.exports = Reserve;

function Reserve() {
  if (!(this instanceof Reserve))
    return new Reserve();
}

/**
 * Reserve your example based seats in ingresso
 *
 * @param String perfId
 * @param String ticketTypeCode
 * @param String priceBandCode
 * @param Integer noOfSeats
 * @param Array discounts
 * @param Object specialCase, For handle some special case, like event for all
                 days we need to send departure_date (use format DD-MM-YYYY)
 * @param Object otherParams, For send other param supported by ingress reserve API
 * @return {Promise}
 * @public
 */

Reserve.prototype.reserveSeats = function (perfId, ticketTypeCode, priceBandCode, noOfSeats, discounts, specialCase, otherParams, seatIds, discList) {
  var alise = 'reserve.v1';
  var url = config.data.url + alise + '/' + config.data.user;
  specialCase = (typeof specialCase == 'object') ? specialCase : {};
  otherParams = (typeof otherParams == 'object') ? otherParams : {};

  var params = {
    user_passwd: config.data.password,
    perf_id: perfId,
    ticket_type_code: ticketTypeCode,
    price_band_code: priceBandCode,
    no_of_seats: noOfSeats
  };

  if (seatIds) {
    params = Object.assign(params, seatIds.reduce((seatObject, element, index) => {
      seatObject[`seat${index}`] = element;
      return seatObject;
    }, {}));
  }

  if (discList) {
    params = Object.assign(params, discList.reduce((discObject, element, index) => {
      discObject[`disc${index}`] = element;
      return discObject;
    }, {}));
  }
  
  var discountsParams = {};
  for (var j in discounts) {
    var key = 'disc' + j;
    discountsParams[key] = discounts[j];
  }
  if (specialCase.hasOwnProperty('all_days')) {
    var allDaysEvent = specialCase.all_days;
    if (allDaysEvent.hasOwnProperty('departure_date')) {
      var departureDate = (new moment(allDaysEvent.departure_date, 'DD-MM-YYYY').isValid()) ?
        new moment(allDaysEvent.departure_date, 'DD-MM-YYYY') :
        new moment();
      params = Object.assign({}, params, {
        departure_date: departureDate.format('YYYYMMDD')
      });
    }
  }
  params = Object.assign({}, params, discountsParams);
  params = Object.assign({}, params, otherParams);
  var output = {
    "status": "",
    "error": 0,
    "message": "",
    "data": {
      "meta": {},
      "results": {}
    }
  };
  return new Promise(function(resolve, reject) {
    if (!(perfId && ticketTypeCode && priceBandCode && noOfSeats)) {
      output.status = 10003;
      output.error = 1;
      output.message = "Performance Id or Ticket Type Code or Price Band Code is/are missing";
      reject(output);
    } else {
      request
        .post(url)
        .query(params)
        .set('Accept', 'application/json')
        .end(function(err, res) {
          if (err) {
            output.status = err.errno;
            output.error = 1;
            reject(output);
          } else {
            var reserveResp = JSON.parse(res.text);
            let {transaction_status, unreserved_orders } = reserveResp;
            if (!transaction_status && transaction_status !== 'reserved') {
              output.status = 10004;
              output.error = 1;
              output.message = "Tickets for this event are currently unavailable.";
              output.data.results = reserveResp
              reject(output);
            } else {
              output.status = res.statusCode;
              output.error = 0;
              output.data.results = reserveResp;
              output.data.results.transaction_uuid = reserveResp.trolley_contents.transaction_uuid;
              resolve(output);
            }
          }
        });
    }
  });

}

Reserve.prototype.releaseSeats = function(transactionUUID) {
  var alise = 'release.v1';
  var url = config.data.url + alise + '/' + config.data.user;
  var params = {
    user_passwd: config.data.password,
    transaction_uuid: transactionUUID
  };
  var output = {
    "status": "",
    "error": 0,
    "message": "",
    "data": {
      "meta": {},
      "results": {}
    }
  };
  return new Promise(function(resolve, reject) {
    if (transactionUUID == null) {
      output.status = 10005;
      output.error = 1;
      output.message = "Something went wrong while reserving your tickets. Please try again.";
      reject(output);
    } else {
      request
        .post(url)
        .query(params)
        .set('Accept', 'application/json')
        .end(function(err, res) {
          var releaseStatus = JSON.parse(res.text);
          if (err) {
            output.status = err.errno ? err.errno : (releaseStatus.error_code ? releaseStatus.error_code : 0);
            output.error = 1;
            output.message = releaseStatus.error_desc;
            reject(output);
          } else {
            output.status = res.statusCode;
            output.error = 0;
            output.data.results = releaseStatus;
            resolve(output);
          }
        });

    }
  });
}