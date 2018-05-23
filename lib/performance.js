/*!
 * Performance
 * develop by PRDXN
 *
 *
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */

const request = require('superagent');
const moment = require('moment');
var dataMapping = require('./data-mapping.json');
var conf = require('./config');
var config = conf.getInstance();


/**
 * Module exports.
 * @public
 */

module.exports = Performance;


function Performance() {
  if (!(this instanceof Performance))
    return new Performance();
}

/**
 * return all performances of event id data wrapt in promise object
 *
 * @param Integer eventId
 * @param Date start date
 * @param Date end date
 * @param Object filterParams, For send other performance filter params supported by Ingresso Performance API
 * @return {Promise}
 * @public
 */

Performance.prototype.allPerformances = function(eventId, startDateStr, endDateStr, filterParams) {
  var alise = 'performances.v1';
  var url = config.data.url + alise + '/';
  filterParams = (typeof filterParams == 'object') ? filterParams : {};
  if (!filterParams.hasOwnProperty('page_length')) {
    filterParams.page_length = 400;
  }

  var params = {
    req_cost_range: "",
    //req_avail_details : "",
    event_id: eventId,
    req_cost_range : true,
    req_cost_range_best_value_offer : true
  };
  params = Object.assign({}, params, filterParams);
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
    if (eventId == null) {
      output.status = 10001;
      output.error = 1;
      output.message = "Event Id is missing";
      reject(output);
    } else {
      var startDate = (new moment(startDateStr, 'DD-MM-YYYY').isValid()) ? new moment(startDateStr, 'DD-MM-YYYY') : new moment();
      var currentDate = (new moment(startDateStr, 'DD-MM-YYYY').isValid()) ? new moment(startDateStr, 'DD-MM-YYYY') : new moment();
      var endDate = (new moment(endDateStr, 'DD-MM-YYYY').isValid()) ? new moment(endDateStr, 'DD-MM-YYYY') : startDate.add(400, 'days');
      var dateFilter = currentDate.format('YYYYMMDD') + ':' + endDate.format('YYYYMMDD');
      //params = Object.assign({}, params, {date_range: dateFilter});
      var datesList = {};
      for (; currentDate.diff(endDate, 'days') <= 0; currentDate.add(1, 'days')) {
        datesList[currentDate.format('DD-MM-YYYY')] = {};
      }
      request
        .get(url)
        .query(params)
        .set('Accept', 'application/json')
        .auth(config.data.user, config.data.password)
        .end(function(err, res) {
          if (err) {
            output.status = err.errno;
            output.error = 1;
            reject(output);
          } else {
            var list = JSON.parse(res.text).results.performance;
            var firstDate, firstTime,lastDate,lastTime;
            var listLength = list.length;
            for (var i in list) {
              if (list[i].date_desc) {
                if (list[i].time_desc) {
                  list[i].time_desc = list[i].time_desc.replace(/ /g, '').toLowerCase();
                }
              }
              var date = list[i].date_desc ? list[i].date_desc : "all_days";
              var time = list[i].time_desc ? list[i].time_desc : "any_time";

              var isodate = (getValue(list[i], 'iso8601_date_and_time', false)) ?
                moment(list[i].iso8601_date_and_time).utc().format('DD-MM-YYYY').toString() :
                "all_days";
              var isotime = getValue(list[i], 'time_desc', false) ?
                moment(list[i].time_desc, "h.mm am").format('HH:mm').toString() :
                "any_time";

              if (i == 0) {
                firstDate = date;
                firstTime = time;
              }

              if(i == listLength - 1) {
                lastDate = date;
                lastTime = time;
              }

              if (date === 'all_days') {
                datesList = {};
                datesList[isodate] = {};
                datesList[isodate][isotime] = setPerformanceObj(list[i]);
              } else {
                if (datesList[isodate] != undefined) {
                  datesList[isodate][isotime] = setPerformanceObj(list[i]);
                } else {
                  datesList[isodate] = {};
                  datesList[isodate][isotime] = setPerformanceObj(list[i]);
                }
              }

            }
            output.status = res.statusCode;
            output.error = 0;
            output.data.meta = JSON.parse(res.text).results.paging_status
            output.data.results = datesList;
            output.data.results.firstDate = firstDate;
            output.data.results.firstTime = firstTime;
            output.data.results.lastDate = lastDate;
            output.data.results.lastTime = lastTime;
            resolve(output);
          }
        });
    }
  });

}

/**
 * Return PERFORMANCE object with performance information
 *
 * @param Object performance object codes from ingresso
 * @return Object
 * @private
 */

function setPerformanceObj(ele) {
  var performObj = {};

  performObj.cached_max_seats = getValue(ele, 'cached_max_seats', null);
  performObj.date_desc = getValue(ele, 'date_desc', 'all_days');
  performObj.event_id = ele.event_id;
  performObj.has_pool_seats = ele.has_pool_seats;
  performObj.is_ghost = ele.is_ghost;
  performObj.is_limited = ele.is_limited;
  performObj.iso8601_date_and_time = getValue(ele, 'iso8601_date_and_time', null);
  performObj.perf_id = ele.perf_id;
  performObj.running_time = getValue(ele, 'running_time', null);
  performObj.time_desc = getValue(ele, 'time_desc', 'any_time');
  performObj.min_cost_range = (ele.cost_range != undefined) ? ele.cost_range.min_seatprice : null;
  performObj.best_value_offer = ele.cost_range && ele.cost_range.best_value_offer;
  performObj.offers = ele.cost_range;
  return performObj;
}

/**
 * Use for handle undefined property od object
 *
 * @param Object
 * @param String property of object
 * @param AnyType else Value if property is undefined
 * @return AnyType elseValue
 * @private
 */

function getValue(obj, prop, elseValue) {
  if (obj != undefined && obj[prop] != undefined && obj != null) {
    return obj[prop];
  } else {
    return elseValue;
  }
}