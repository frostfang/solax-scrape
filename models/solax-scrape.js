// This grabs the CSV file from the website
var request = require('request');
var async = require('async');
var fs = require('fs');

module.exports = function(config){
    
    // expose some properties
    this.workingCSVFile = config.workingFile;
    
    // just a run function to kick it off
    this.run = function(startDate,endDate,doneCB){
        async.waterfall([
            function getLogin(cb){
                // login first
                // build the calendar request for the current state
                var opt = {
                    url: 'http://www.solax-portal.com/dz/home/login',
                    form:{
                        username: config.auth.user,
                        password: config.auth.pass,
                        saveStatus: true,
                        ValidateCode: 'False',
                        url:'/user/clientIndex'
                    },
                    jar: true
                };

                request.post(opt, function(err, resp, body) {
                    // http log, regardless of response
                    
                    //console.log(err,resp);
                    cb(err);
                     
                });
                
            },
            function getReport(cb){
                // get the report
                
                var rUri = 'http://www.solax-portal.com/dz/user/ReportResult/' + 
                            config.siteId.toString() + 
                            '?StartTime=' + startDate.toJSON().split('T')[0] + 
                            '&EndTime=' + endDate.toJSON().split('T')[0] + 
                            '&export=true&reportType=0';
                            
// Example query strings    
// timeTypeSel=2017-07-09&StartTime=2017-07-09&EndTime=2017-07-09&Time1=2017-07&Time2=2017&export=true&reportType=0
// timeTypeSel=2017-07-02&StartTime=2017-07-12&EndTime=2017-07-14&Time1=2017-07&Time2=2017&export=true&reportType=0
// StartTime=2017-06-14&EndTime=2017-07-14&export=true&reportType=0

                var opt = {
                    url: rUri,
                    jar: true
                };

                request.get(opt, function(err, resp, body) {
                    // http log, regardless of response
                    
                    //console.log(err,resp);
                    cb(err);
                    
                }).pipe(fs.createWriteStream(config.workingFile || 'solax-export.csv'));
                
            }
        ],
        
        function final(err){
            
            if(doneCB)
                return doneCB(err);
        });
            
        
    };
    
};
