var http = require('http');
var path = require('path');
var express = require('express');
var fs = require('fs');
var cloudant = require('cloudant');
var underscore = require('underscore');
var solaxscrape = require('./models/solax-scrape');
var solaxrunner = require('./models/solax-runner');
var moment = require('moment');
var CronJob = require('cron').CronJob;

// outputting the server time
var tzDate = new Date();
console.log('server started ', tzDate);
console.log('server timezone offset', tzDate.getTimezoneOffset());
console.log('server toJSON', tzDate.toJSON());
console.log('server moment', moment(tzDate).format('YYYY-MM-DD HH:mm:ss'));

// the working file directory
var workingDir = 'csv';
var workingCSVFile = workingDir + '/solax-export.csv';
// create the working directory if needed
if (!fs.existsSync(workingDir)){
    fs.mkdirSync(workingDir);
}

// the scraper
var scraper = new solaxscrape({ 
    auth:{ 
        user: process.env.SCRAPE_USER, 
        pass: process.env.SCRAPE_PASS
    }, 
    siteId: process.env.SCRAPE_SITEID,
    workingFile: workingCSVFile
});
// the scraper runner
var runner;
// the cron context
var job;
// cloudant context
var cdb;

// and establish the context
cloudant({ 
    account: process.env.CDB_USR_KEY,
    key: process.env.CDB_API_KEY,
    password: process.env.CDB_API_SECRET
},
function(err, clCtx){
    // cdb context
    if(err)
        return console.log("Error connecting to cloudant", err);
    
    // establish the cdb context
    cdb = clCtx.db.use(process.env.CDB_DB);
    
    // create the runner
    runner = new solaxrunner(scraper,cdb);
    
    // create the cron job
    var cronPattern = process.env.APP_CRON_PATTERN || '0 */20 * * * *';
    //var cronPattern = '0 */1 * * * *';
    job = new CronJob(cronPattern, function(){
        console.log('running scrape [' + cronPattern + ']');
        
        // setup the working dates
        var workingEndDate = new Date();
        workingEndDate.setHours(0,0,0,0);
        var workingStartDate = new Date(workingEndDate);
        workingStartDate.setDate(workingStartDate.getDate() + ((1 - process.env.SCRAPE_DAYS) || 1));
        
        // and kick off the runner
        runner.run(workingStartDate, workingEndDate, function(){
            console.log('scraped and saved');
        });
        
    });
    
    // and kick it off within the cdb context
    job.start();
    console.log('cron started');
    // very first date 2017-07-04
    // TODO: add in express and some api methods

});


// The express server for actions if needed
var router = express();
var server = http.createServer(router);

router.get('/', function(req,res){
    res.send('scraper running ' + process.env.APP_CRON_PATTERN || '0 */20 * * * *');
});

router.get('/run', function(req,res){
    
    // TODO: allow the passing of dates from the query string
    // TODO: pass back the response from the runner bulk update so you get the info on the page
    
    // setup the working dates
    var workingEndDate = new Date();
    workingEndDate.setHours(0,0,0,0);
    var workingStartDate = new Date(workingEndDate);
    workingStartDate.setDate(workingStartDate.getDate() + ((1 - process.env.SCRAPE_DAYS) || 1));
    
    // and kick off the runner
    console.log('running scrape - via express /run');
    runner.run(workingStartDate, workingEndDate, function(){
        console.log('scraped and saved - via express /run');
        res.send('scraped and saved');
    });
});

// kick off the server
server.listen(
    process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 3000, 
    process.env.OPENSHIFT_NODEJS_IP || process.env.IP || "0.0.0.0", 
    function(){
        var addr = server.address();
        console.log("solax scraper server listening at", addr.address + ":" + addr.port);
});
