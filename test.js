var Ingresso = require('./index.js');

var ing = Ingresso({
    "user" : "kiddoo-dev",
    "password" : "demopass",
    "url" : "https://demo.ticketswitch.com/f13/",
  });

//    var ing = Ingresso({});
ing.events.allEvents({}).then(
  function(value) {
    //console.log(value.data.results);
    var eventId = value.data.results[2].igEventId;
    eventId = '3RK4';
    console.log('Event ID: ', eventId);
    ing.performance.allPerformances(eventId,'', '', {page_length: 300}).then(
      function(value) {
        //console.log(value.data.results);
        var perfList = value.data.results;
        var perfId;
        console.log('firstDate: ' + value.data.results.firstDate);
        console.log('firstTime: ' + value.data.results.firstTime);
       console.log(perfList);
      //  console.log(JSON.stringify(perfList));
        for(var i in perfList) {

          var pref = perfList[i];
          var flag = false; // only for terminate loop after one perf selected
          for(var j in pref) {
            //console.log(pref);
            if(Object.keys(pref[j]).length > 0) {
              perfId = pref[j].perf_id;
              console.log('pref ID: ', pref[j].perf_id);
              console.log('Date :', pref[j].date_desc);
              console.log('Time :', pref[j].time_desc);
              flag = true;
              break;
            }
          }
          if(flag) {
            break;
          }
        }

        //check for availability
        ing.availability.getAvailableExampleSeatBased(perfId, {}).then(
          function(value) {
            var availabilityInfo = value.data.results.availability;
            console.log('Seat Availability:', availabilityInfo)},
          function(reson) {console.log(reson)});
      } ,
      function(reson) {
        console.log(reson);

      });
  }, function(reson) {console.log(reson)});

// ing.performance.allPerformances('6IE','01-05-2017', '01-06-2017', {page_length: 300}).then(
//   function(value) {
//     console.log(value.data.result);
//   } ,
//   function(reson) {
//     console.log(reson);
//     //return reson
//   });


// ing.availability.getAvailableExampleSeatBased('I3T-B1T', {}).then(
//   function(value) {console.log(value.data.results.availability)},
//   function(reson) {console.log(reson)});

// ing.reserve.reserveSeats('I3T-B1T', 'SINGLE', 'A/pool', 1, [], {}).then(
//   function(value) {
//     console.log(value.data.results)
//   },
//   function(reson) {console.log(reson)});

  // ing.availability.getAvailableExampleSeatBased('I3T-B1T', {}).then(
  //   function(value) {console.log(value.data.results.availability)},
  //   function(reson) {console.log(reson)});

// ing.reserve.releaseSeats('546272f1-203f-11e7-bede-0025903268a0').then(
//   function(value) {console.log(value.data.results)},
//   function(reson) {console.log(reson)});
