/*!
 * Availability
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

 module.exports = Availability;

 function Availability() {
   if (!(this instanceof Availability))
     return new Availability();
 }


 /**
  * return availability  based on example seat of performances based on perf id, data wrapt in promise object
  *
  * @param String perfId
  * @return {Promise}
  * @public
  */

 Availability.prototype.getAvailableExampleSeatBased = function(perfId, filterParams) {
   var alise = 'availability.v1';
   var url =  config.data.url + alise  + '/' + config.data.user;
   filterParams = (typeof filterParams == 'object') ? filterParams : {};

   var params = {
     user_passwd : config.data.password,
     perf_id: perfId,
     //add_seat_blocks: "",
     add_example_seats: "",
     add_discounts: ""
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
     if(perfId == null) {
       output.status = 10002;
       output.error = 1;
       output.message = "Performance Id is missing"
       reject(output);
     } else {

       request
         .get(url)
         .query(params)
         .set('Accept', 'application/json')
         .end(function(err, res) {
           if(err) {
             output.status = err.errno;
             output.error = 1;
             reject(output);
           } else {
             var availabilityList = [];
             var ticketTypeList = JSON.parse(res.text).availability.ticket_type;

             for (var i in ticketTypeList) {
               var ticket_type_code = ticketTypeList[i].ticket_type_code;
               var ticket_type_desc =  ticketTypeList[i].ticket_type_desc;
               var priceBandList = ticketTypeList[i].price_band;
               for(var j in priceBandList) {
                 var priceBand = priceBandList[j];
                 priceBand.ticket_type_code = ticket_type_code;
                 priceBand.ticket_type_desc = ticket_type_desc;
                 availabilityList.push(priceBand);
               }
             }
             output.status = res.statusCode;
             output.error = 0;
             output.data.results.availability = availabilityList;
             output.data.results.currency_code = JSON.parse(res.text).currency_code
             resolve(output);
           }
         });
     }
   });

 }
