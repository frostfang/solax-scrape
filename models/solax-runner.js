var underscore = require('underscore');
var solaxscsv = require('./solax-csvtojson');
var moment = require("moment");

module.exports = function(scraper, cdb){
    
    // the run method
    this.run = function(startDate,endDate,finalCB){
        
        // kick off the scraper
        scraper.run(startDate,endDate,function doneScrape(err){
            // handle the error
            if(err)
                return console.log(err);
                
            // once scraped, kick of the push into the database
            console.log('csv scraped now pushing to db');
            
            // establish the log
            var scrapeLog = {
                // _id: "log," + (new Date()).toJSON(),
                _id: "log," + moment().format('YYYY-MM-DD HH:mm:ss'),
                timezoneOffset: "UTC"
            };
            
            // establish the document array
            var docArr = [];
            
            // grab the json from the file the scraper saved
            solaxscsv({
                filePath: scraper.workingCSVFile
            }, 
            function perItemCB(obj,sitename,i){
                // executes per item
          
                // the document to go to cdb
                docArr.push({
                    _id: obj.ssLastUpdated + "," + sitename,
                    timezoneOffset: "TODO: somehow scrape this from the site",
                    siteId: process.env.SCRAPE_SITEID,
                    siteName: sitename,
                    data: obj
                });
                
            },
            function doneCB(err){
                // executes on completion
                // return if there is an error
                if(err)
                    return console.log(err);
                
                // bulk fetch all the docs
                var fetchKeys = { keys: underscore.pluck(docArr, '_id')};
                cdb.fetch(fetchKeys, function(fErr,fBody,fHdrs){
                    
                    // get a map of ids and revs
                    var idMap = underscore.reduce(fBody.rows, function(m,v){ 
                        if(v.value)
                            m[v.id] = v.value.rev;
                        return m;
                    },{});
                    
                    // update the docs with the rev
                    underscore.each(docArr, function(v){ 
                        if(idMap[v._id]) 
                            v._rev = idMap[v._id];
                    });
                    
                    // push the docs to cdb
                    cdb.bulk({ docs: docArr }, function(bErr,bBody, bHdrs){
                        if(bErr)
                            console.log(bErr);
                        
                        // finally log the results
                        scrapeLog.BulkErrors = underscore.filter(bBody, function(v){ return (v.error); });
                        scrapeLog.FetchKeys = fetchKeys;
                        scrapeLog.IdRevMap = idMap;
                        
                        
                        // and push the log to cdb
                        cdb.insert(scrapeLog, function(lErr,lBody,lHdrs){ if(lErr) return console.log(lErr,lHdrs); });
                        
                        // callback if needed
                        if(finalCB)
                            finalCB();
                    });
                    
                    
                });
            
        
            });
   
            
        });
    };
    
};