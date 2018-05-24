/*!
 * event
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
var eventModel = require('./model/event-model');
var dataMapping = require('./data-mapping.json');
var conf = require('./config');
var config = conf.getInstance();
var _ = require('lodash');

/**
 * Module exports.
 * @public
 */

module.exports = Events;


function Events() {
  if (!(this instanceof Events))
    return new Events();
}

/**
 * return all events data wrapt in promise object
 *
 * @param filterParams
 * @return {Promise}
 * @public
 */

Events.prototype.allEvents = function(filterParams, selectionParams) {
  var alise = 'events.v1';
  var url =  config.data.url + alise  + '/';
  filterParams = (typeof filterParams == 'object') ? filterParams : {};
  var params = selectionParams && typeof selectionParams == 'object' ? Object.assign(selectionParams) : {
    req_media_triplet_one: "",
    req_cost_range: "",
    req_cost_range_details: "",
    req_extra_info: "",
    //  req_reviews: "",
    req_media_triplet_one: "",
    req_media_triplet_two: "",
    req_media_triplet_three: "",
    req_media_triplet_four: "",
    req_media_triplet_five: "",
    req_media_seating_plan: "",
    req_media_square: "",
    req_media_landscape: "",
    req_media_marquee: "",
    req_media_supplier: "",
    //    req_video_iframe: "",
    //    req_avail_details: "",
    //    req_avail_details_with_perfs: "",
    req_meta_components: "",
    req_custom_fields: "",
    req_internal_codes: "",
    //    req_sale_mode: "",
    req_src_info: "",
    req_collect_text: "",
    event_info: "",
    content: "",
    req_avail_details_with_perfs: ""
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
    request
      .get(url)
      .query(params)
      .set('Accept', 'application/json')
      .auth(config.data.user, config.data.password)
      .end(function(err, res) {
        if(err) {
          output.status = err.errno;
          output.error = 1;
          reject(output);
        } else {
          var list = JSON.parse(res.text).results.event;
          var eventList = list.map(function(ele) {
            return setEventObj(ele);
          });
          output.status = res.statusCode;
          output.error = 0;
          output.data.meta = JSON.parse(res.text).results.paging_status
          output.data.results = eventList;
          resolve(output);
        }
      });
    });
}

/**
 * Return EVENT object with all event information, media and venue
 *
 * @param Object event object codes from ingresso
 * @return Object
 * @private
 */

function setEventObj(ele) {
  var obj = {};
  for (var variable in eventModel) {
    if (eventModel.hasOwnProperty(variable)) {
      var check = ((dataMapping[variable] != null) && (ele[dataMapping[variable]] != undefined) )? true : false ;
      obj[variable] = (check) ? ele[dataMapping[variable]] : null;
    }
  }

  obj['thirdPartyCostRange'] = _.get(ele, 'cost_range') ? _.get(ele, 'cost_range.min_seatprice') + _.get(ele, 'cost_range.min_surcharge') || 0 : null;
  obj['media'] = setMediaObj(ele);
  obj['venue'] = setVenueObj(ele);
  return obj;
}

/**
 * Retuern Media information of Event
 *
 * @param Object event object codes from ingresso
 * @return Object
 * @private
 */

function setMediaObj(ele) {
  var mediaList = []
  var mediaListOfEvent = ele.media;
  if(mediaListOfEvent != undefined) {
    var mlist = mediaListOfEvent.media_asset;
    for (var mediaObj in mlist) {
      var mobj = {};
      mobj.caption = mediaListOfEvent.media_asset[mediaObj].caption;
      mobj.name = mediaListOfEvent.media_asset[mediaObj].name;
      mobj.secureCompleteUrl = mediaListOfEvent.media_asset[mediaObj].secure_complete_url;
      mobj.insecureCompleteUrl = mediaListOfEvent.media_asset[mediaObj].insecure_complete_url;
      mediaList.push(mobj);
    }
  }
  return mediaList;
}

/**
 * Retuern Venue information of Event
 *
 * @param Object event object codes from ingresso
 * @return Object
 * @private
 */

function setVenueObj(ele) {
  var venueObj = {};
  venueObj.venueDesc = getValue(ele, 'venue_desc', null);
  venueObj.venueStreet = ((getValue(ele, 'structured_info', null) != null)  &&  (getValue(ele.structured_info, 'address', null) != null)) ? getValue(ele.structured_info.address, 'value', null): null ;
  venueObj.venueCity = getValue(ele, 'city_desc', null);
  venueObj.igVenueCityCode = getValue(ele, 'city_code', null);
  venueObj.igVenueCountry = getValue(ele, 'country_desc', null);
  venueObj.venueCountryCode = getValue(ele, 'country_code', null);
  venueObj.venueLongitude = getValue(ele.geo_data, 'longitude', null);
  venueObj.venueLatitude = getValue(ele.geo_data, 'latitude', null);
  venueObj.venuePostcode = getValue(ele, 'postcode', null);
  if (venueObj.venueLatitude && venueObj.venueLongitude) {
    venueObj.coordinates = [venueObj.venueLongitude, venueObj.venueLatitude ];
  }

  return venueObj;
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
  if(obj!= undefined && obj[prop] != undefined && obj != null) {
    return obj[prop];
  } else {
    return elseValue;
  }
}

/**
 * Description: Get Events Details by eventIds
 * @param: {eventsIdList, extraParams} List eventIds in array and extra params objects
 */
Events.prototype.eventsById = function ({
  eventsIdList,
  extraParams = {}
}) {

  return new Promise(function (resolve, reject) {
    try {
      var alise = 'events_by_id.v1';
      var url = config.data.url + alise + '/';
      var params = Object.assign(extraParams, {
        event_id_list: eventsIdList.toString()
      });

      var output = {
        "status": "",
        "error": 0,
        "message": "",
        "data": {
          "meta": {},
          "results": {}
        }
      };
      request
        .get(url)
        .query(params)
        .set('Accept', 'application/json')
        .auth(config.data.user, config.data.password)
        .end(function (err, res) {
          if (err) {
            output.status = err.errno;
            output.error = 1;
            reject(output);
          } else {
            output.status = res.statusCode;
            output.error = 0;
            output.data.results = JSON.parse(res.text).events_by_id;
            resolve(output);
          }
        });
    } catch (error) {
      output.status = error.status;
      output.error = 1;
      output.message = error.message;
      reject(output);
    }
  });
}

Events.prototype.eventsByIdNew = function (eventId) {
  return new Promise(function (resolve, reject) {
    try {
      var url = `https://kidadl.ticketswitch.com/api/event/${eventId}/`;

      var output = {
        "status": "",
        "error": 0,
        "message": "",
        "data": {
          "meta": {},
          "results": {}
        }
      };
      request
        .get(url)
        .auth(config.data.user, config.data.password)
        .end(function (err, res) {
          if (err) {
            output.status = err.errno;
            output.error = 1;
            reject(output);
          } else {
            console.log("JSON.parse(res.text) ", JSON.parse(res.text));
            output.status = res.statusCode;
            output.error = 0;
            output.data.results = JSON.parse(res.text);
            resolve(output);
          }
        });
    } catch (error) {
      output.status = error.status;
      output.error = 1;
      output.message = error.message;
      reject(output);
    }
  });
}

Events.prototype.allEventsUnmapped = function (filterParams, selectionParams) {
  var alise = 'events.v1';
  var url = config.data.url + alise + '/';
  filterParams = (typeof filterParams == 'object') ? filterParams : {};
  var params = selectionParams && typeof selectionParams == 'object' ? Object.assign(selectionParams) : {
    req_media_triplet_one: "",
    req_cost_range: "",
    req_cost_range_details: "",
    req_extra_info: "",
    //  req_reviews: "",
    req_media_triplet_one: "",
    req_media_triplet_two: "",
    req_media_triplet_three: "",
    req_media_triplet_four: "",
    req_media_triplet_five: "",
    req_media_seating_plan: "",
    req_media_square: "",
    req_media_landscape: "",
    req_media_marquee: "",
    req_media_supplier: "",
    //    req_video_iframe: "",
    //    req_avail_details: "",
    //    req_avail_details_with_perfs: "",
    req_meta_components: "",
    req_custom_fields: "",
    req_internal_codes: "",
    //    req_sale_mode: "",
    req_src_info: "",
    req_collect_text: "",
    event_info: "",
    content: "",
    req_avail_details_with_perfs: ""
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

  return new Promise(function (resolve, reject) {
    request
      .get(url)
      .query(params)
      .auth(config.data.user, config.data.password)
      .set('Accept', 'application/json')
      .end(function (err, res) {
        if (err) {
          output.status = err.errno;
          output.error = 1;
          reject(output);
        } else {
          resolve(JSON.parse(res.text));
        }
      });
  });
}