var fs = require("fs");

// couchdb design doc - logging
// marker function for the couchdb internal function
var emit = function(){ console.log(arguments)};

// map function: logging docs are emitted
var map_scrapelog = function(doc){
    if(doc.FetchKeys && doc.BulkErrors){
        var dte = doc._id.split(',')[1];
        emit(dte, { docs: doc.FetchKeys.keys.length, bulkerrors: doc.BulkErrors.length });
    }    
};

// tests
fs.readFile('log-1.json', function(err, data){ 
    map_scrapelog(JSON.parse(data));
});