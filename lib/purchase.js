/*!
 * Purchase
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

 module.exports = Purchase;

 function Purchase() {
   if (!(this instanceof Purchase))
     return new Purchase();
 }

 /**
  * Purchase your seats in ingresso
  *
  * @param String transactionUUID
  * @param String firstName
  * @param String lastName
  * @param String emailAddress
  * @param String countryCode
  * @param String addressLineOne
  * @param String town
  * @param String phone
  * @param Object otherParams
  * @return {Promise}
  * @public
  */

 Purchase.prototype.purchaseSeats = function(transactionUUID, firstName, lastName,
                                            emailAddress, countryCode, addressLineOne,
                                            town, phone, otherParams) {
   var alise = 'purchase.v1';
   var url =  config.data.url + alise  + '/';
   otherParams = (typeof otherParams == 'object') ? otherParams : {};

   var params = {
     transaction_uuid : transactionUUID,
     first_name : firstName,
     last_name : lastName,
     email_address : emailAddress,
     country_code : countryCode,
     address_line_one : addressLineOne,
     town : town,
     phone : phone
   };
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
     if(!(transactionUUID && firstName && lastName && emailAddress && countryCode && addressLineOne && town && phone) ) {
       output.status = 10006;
       output.error = 1;
       output.message = "Transaction UUID or other requried params is/are missing";
       reject(output);
     } else {
       request
         .post(url)
         .query(params)
         .auth(config.data.user, config.data.password)
         .set('Accept', 'application/json')
         .end(function(err, res) {
           var purchaseResp = JSON.parse(res.text);
           if(err) {
             output.status = err.errno ?  err.errno : (purchaseResp.error_code ? purchaseResp.error_code : 0);
             output.error = 1;
             output.message = purchaseResp.error_desc ? purchaseResp.error_desc : '';
             reject(output);
           } else {
               output.status = res.statusCode;
               output.error = 0;
               output.data.results = purchaseResp;
               resolve(output);
           }
         });
     }
   });
 }
