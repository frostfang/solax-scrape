// This grabs the CSV file from the website
var request = require('request');
var async = require('async');
var underscore = require("underscore");
var moment = require('moment');

// TODO: I'm going to stop hitting the api for now, the date keys don't matchup too well.


//module.exports = function(config){
var TESST = function(config){  
    
    var resultMap = {};
    
    var powerResultMap = {
        t:'TimeStamp',
        v1:'PowerNowW',
        v2:'InputPowerW',
        v3:'FeedInPowerW'
    };
    
    // just a run function to kick it off
    this.run = function(startDate,endDate,doneCB){
        console.log('started');
        async.waterfall([
            function getToken(cb){
                // login auth and get the token
                console.log('auth started');
                var rUri = 'http://al.lewei50.com/api/v1/user/Login?username=' + 
                        config.auth.user + '&password=' + config.auth.pass + '&lang=en';
                
                // fire the request
                request.get({ url: rUri, json: true }, function(err, resp, body) {
                    
                    // TODO: procees and error/fail response i.e. login fail

                    // data.id and data.token are the bits we care about
                    cb(err, body.data);
                });
                
            },
            function loopDates(tokenData, cb){
                console.log('loop dates started');
                // get the dates to loop through
                var daystoget = Math.floor((endDate - startDate) / (1000*60*60*24));
                var datesArr = [];
                console.log((endDate - startDate) / (1000*60*60*24));
                // if the dates are the same or the wrong way around then set to 1
                
                for(var i = 0;  i <= daystoget; i++){
                    var datetoget = new Date(startDate);
                    datetoget.setDate(startDate.getDate() + i);
                    datesArr.push(datetoget);
                }

                // non blocking looping of array
                underscore.each(datesArr, function(v){ 
                    cb(null, tokenData, v); 
                });
                // or maybe datesArr.forEach(function(v){...});
            },
            function getPower(tokenData, dateToGet, cb){
                console.log('getPower started');
                // powerline endpoint
                
                var rUri = 'http://al.lewei50.com/api/v1/site/powerLine_AL_SE/' + 
                            config.siteId.toString() + 
                            '?date=' + dateToGet.toJSON().split('T')[0] + 
                            '&lang=en&token=' + tokenData.token;
                
                // fire the request
                request.get({ url: rUri, json:true }, function(err, resp, body) {
                    
                    // TODO: procees and error/fail response i.e. api fail
                    
                    // process the response, its in the form of an array containing these objects
                    // { t: '2017/7/19 20:30:00', v1: 0, v2: 0, v3: -692 }
                    // t - timestamp
                    // v1 - Power Now (W)
                    // v2 - Input Power (W)
                    // v3 - Feed In Power (W) (or total running)
                    
                    underscore.each(body.data, function(v){ 
                        if(!(v.t in resultMap))
                            resultMap[v.t] = {};
                        
                        resultMap[v.t][powerResultMap.v1] = v.v1;
                        resultMap[v.t][powerResultMap.v2] = v.v2;
                        resultMap[v.t][powerResultMap.v3] = v.v3;
                    });
                    
                    // non blocking so we don't need to wait for the array to finish to proceed
                    cb(err, tokenData, dateToGet);
                    
                });
                
            },
            function getInverterList(tokenData, dateToGet, cb){
                console.log('getInverterList started');
                
                var rUri = 'http://al.lewei50.com/api/v1/site/inverterList/' + 
                    config.siteId.toString() + '?lang=en&token=' + tokenData.token;
                
                request.get({ url: rUri, json:true }, function(err, resp, body) {
                    
                    // TODO: procees and error/fail response i.e. api fail
                    
                    // body is an array of inverters, each inverter has the endpoint key
                    // for each call there is a dataDict array that holds each of the keys
                    // the data inverter will output
                    
                    // TODO: You need to handle if there is more than 1 item
                    // in the array, if you look in the loopEndpoints() function
                    // there is a bunch of counters, those are localised to the 
                    // function but if you have more than 1 item in this array 
                    // then you will get the callback called twice...
                    
                    // loop through each of the inverters
                    // underscore.each(body.data, function(i) {
                    //     cb(err, tokenData, dateToGet, i);
                    // });
                    // For now - just going to keep to the 1 inverter per site
                    // this might get complicated later. Maybe just add a inverter
                    // to the result map...
                    cb(err, tokenData, dateToGet, body.data[0]);
                    
                });
            },
            function loopEndpoints(tokenData, dateToGet, inverterData, cb){
                console.log('loopEndpoints started');
                // loop through the inverter dataDict we want to grab
                var kCounter = 0;
                underscore.each(inverterData.dataDict, function(k) {
                    
                    // build the request
                    var rUri = 'http://al.lewei50.com/api/v1/inverter/dataLine/' + 
                    inverterData.id + '?date=' + dateToGet.toJSON().split('T')[0] +
                    '&columnName=' + k.key + '&lang=en&token=' + tokenData.token;
                    
                    request({ url: rUri, json:true }, function(err,resp,body){
                        
                        // TODO: procees and error/fail response i.e. api fail
                        
                        var vCounter = 0;
                        
                        underscore.each(body.data, function(v) {
                            vCounter++;
                            if(!(v.t in resultMap))
                                resultMap[v.t] = {};
                            
                            // build the key
                            var compKey = k.name.replace(/\s|'/g,"") + k.unit.replace("℃","C");
                            resultMap[v.t][compKey] = v.v;
                            
                            if(vCounter === body.data.length)
                            {
                                kCounter++;
                                if(kCounter === inverterData.dataDict.length)
                                    cb(err, vCounter,kCounter);
                            }
                        });
                        
                    });
                    
                });
            }
        ],
        
        function final(err,lc,kc){
            // the final item being called, return the object

            //console.log(underscore.keys(resultMap));
        
// '2017/7/11 9:30:00',
// '2017/7/11 9:35:00',
// '2017/7/11 9:40:00',
console.log(resultMap['2017/7/11 9:30:00']);
//console.log(resultMap['2017/7/11 9:29:00']);
// '2017/7/10 9:29:00',
// '2017/7/10 9:34:00',
// '2017/7/10 9:39:00',        
        
            if(doneCB)
                return doneCB(err, resultMap);
        });
            
        
    };
    
};


// var test = new TESST({ 
//     auth:{ 
//         user: '', 
//         pass: ''
//     }, 
//     siteId: '120606'
// });

// test.run(new Date('2017-07-10'), new Date('2017-07-11'), function(){  });