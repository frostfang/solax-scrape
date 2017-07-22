// This grabs the CSV file from the website
var request = require('request');
var async = require('async');
var fs = require('fs');
var moment = require('moment');

module.exports = function(config){
    
    // expose some properties
    this.workingCSVFile = config.workingFile;
    
    // just a run function to kick it off
    this.run = function(startDate,endDate,doneCB){
        async.waterfall([
            function getLogin(cb){
                // login first
                console.log('scrape - pre login');
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
                    console.log('scrape - post login');
                    
                    // TODO: Change this and the above so that you don't call toString on 
                    // an undefined object, it needs to look at err and if body exists first
                    
                    if(body.toString().indexOf('Invalid username or password')>=0)
                        err = new Error('Invalid credentials for Solax Portal');

                    cb(err);
                     
                });
                
            },
            function getReport(cb){
                // get the report
                console.log('scrape - pre grab file');
                console.log('scrape - dates', moment(startDate).format('YYYY-MM-DD HH:mm:ss'),moment(endDate).format('YYYY-MM-DD HH:mm:ss'));
                var rUri = 'http://www.solax-portal.com/dz/user/ReportResult/' + 
                            config.siteId.toString() + 
                            '?StartTime=' + moment(startDate).format('YYYY-MM-DD') + 
                            '&EndTime=' + moment(endDate).format('YYYY-MM-DD') + 
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
                    console.log('scrape - post grab file');
                    
                    // TODO: Change this and the above so that you don't call toString on 
                    // an undefined object, it needs to look at err and if body exists first
                    
                    if(body.toString().indexOf('The page will be automatically redirected')>=0)
                        err = new Error('Something in Solax Portal went wrong...');
                        
                    cb(err);
                    
                }).pipe(fs.createWriteStream(config.workingFile || 'solax-export.csv'));
                
            }
        ],
        
        function final(err){
            console.log('scrape - completed, calling doneCB', err);
            if(doneCB)
                return doneCB(err);
        });
            
        
    };
    
};
