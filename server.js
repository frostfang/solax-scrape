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
var rss = require('rss');

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
        console.log('running scrape [' + cronPattern + '] -', moment().format());
        
        // setup the working dates
        var workingEndDate = new Date();
        workingEndDate.setHours(0,0,0,0);
        var workingStartDate = new Date(workingEndDate);
        workingStartDate.setDate(workingStartDate.getDate() + ((1 - process.env.SCRAPE_DAYS) || 1));
        
        // and kick off the runner
        runner.run(workingStartDate, workingEndDate, function(){
            console.log('scraped and saved -', moment().format());
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

//router.use( bodyParser.json() );    // to support JSON-encoded bodies
// router.use(bodyParser.urlencoded({     // to support URL-encoded bodies, Might not need this
//   extended: true
// }));

// the client website for the root application
router.use(express.static(path.resolve(__dirname, 'client')));

// the state of the cron job
router.get('/state', function(req,res){
    res.send('scraper running ' + process.env.APP_CRON_PATTERN || '0 */20 * * * *');
});

// kick off a cron job
router.get('/run', function(req,res){
    
    // TODO: allow the passing of dates from the query string
    // TODO: pass back the response from the runner bulk update so you get the info on the page
    // TODO: also need to add in some views on cloudant
    
    // setup the working dates
    var workingEndDate = new Date();
    workingEndDate.setHours(0,0,0,0);
    var workingStartDate = new Date(workingEndDate);
    workingStartDate.setDate(workingStartDate.getDate() + ((1 - process.env.SCRAPE_DAYS) || 1));
    
    // and kick off the runner
    console.log('running scrape - via express /run -', moment().format());
    runner.run(workingStartDate, workingEndDate, function(){
        var dstamp =  moment().format();
        console.log('scraped and saved - via express /run -', dstamp);
        res.send('scraped and saved - ' + dstamp);
    });
});

// get the logging
router.get('/log', function(req, res) {
    cdb.view('logging', 'scrapeLog', { limit:30, descending:true, reduce:false }, function(err,body,hdrs){
        if(err)
            return res.send(err);
        
        res.send(body);
    });
});

router.get('/log/rss', function(req, res) {
    cdb.view('logging', 'scrapeLog', { limit:30, descending:true, reduce:false }, function(err,body,hdrs){
        if(err)
            return res.send(err);
        
        var logRss = new rss({
            title: 'Solax scraper log rss feed',
            description: 'Log of the most recent fetched items',
            author: 'frostfang83',
            feed_url: 'http://solaxscrape-mpbarber.rhcloud.com/log/rss',
            site_url: 'http://solaxscrape-mpbarber.rhcloud.com/'
        });
        
        // TODO: Add in some logic for determining errors rather than just hitting the endpoint
        // maybe add a view of bulk errors or something.
        body.rows.forEach(function(v){
            logRss.item({
                title: 'scrape log: ' + v.key,
                description: JSON.stringify(v.value),
                url: 'http://solaxscrape-mpbarber.rhcloud.com/log/rss',
                guid: v.key,
                date: v.key.replace(' ','T')
            });
        });
        
        res.send(logRss.xml({indent:true}));
        
    });
});

router.get('/anomalies/rss', function(req, res) {
    cdb.view('logging', 'anomaliesLog', { limit:30, descending:true, reduce:false }, function(err,body,hdrs){
        if(err)
            return res.send(err);
        
        var logRss = new rss({
            title: 'Solax anomalies log rss feed',
            description: 'Log of the most recent anomalies in the data',
            author: 'frostfang83',
            feed_url: 'http://solaxscrape-mpbarber.rhcloud.com/anomalies/rss',
            site_url: 'http://solaxscrape-mpbarber.rhcloud.com/'
        });
        
        body.rows.forEach(function(v){
            logRss.item({
                title: 'scrape log: ' + v.key,
                description: JSON.stringify(v.value),
                url: 'http://solaxscrape-mpbarber.rhcloud.com/anomalies/rss',
                guid: v.key,
                date: v.key.replace(' ','T')
            });
        });
        
        res.send(logRss.xml({indent:true}));
        
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
