var fs = require("fs");

var emit = function(){ console.log(arguments)}; // just a marker function for the couchdb internal function

// map function: cost generated
var map_generatedCost = function(doc){
    
    var tariffGenerate = 0.1;
    var wattMinMultiplier = 6;
    var wattMinToKWhMultiplier = 0.000017;
    
    if(doc.data && doc.siteName){
        // build the watt minutes and cost
        var generateWatt = (doc.data.ssFeedInPowerW > 0)? doc.data.ssFeedInPowerW : 0;
        var generateWattMin = generateWatt * wattMinMultiplier;
        var generateCost = generateWattMin * wattMinToKWhMultiplier * tariffGenerate;
        
        // build the emit key
        var dte = new Date(doc._id.replace(' ','T').split(',')[0]);
        
        emit(
          [dte.getFullYear(), dte.getMonth() + 1, dte.getDate(), dte.getHours(), dte.getMinutes(), dte.getSeconds()], 
          generateCost
        );
    }
};


// map function: cost consumed
var map_consumedCost = function(doc){
    
    var tariffConsume = 0.29;
    var wattMinMultiplier = 6;
    var wattMinToKWhMultiplier = 0.000017;
    
    if(doc.data && doc.siteName){
        // build the watt minutes and cost
        var consumedWatt = 0-((doc.data.ssFeedInPowerW < 0)? doc.data.ssFeedInPowerW : 0);
        var consumedWattMin = consumedWatt * wattMinMultiplier;
        var consumedCost = consumedWattMin * wattMinToKWhMultiplier * tariffConsume;
        
        // build the emit key
        var dte = new Date(doc._id.replace(' ','T').split(',')[0]);
        
        emit(
          [dte.getFullYear(), dte.getMonth() + 1, dte.getDate(), dte.getHours(), dte.getMinutes(), dte.getSeconds()], 
          consumedCost
        );
    }
};


// map function: consumed to generated delta
var map_deltaGeneratedToConsumed = function(doc){
    
    
    if(doc.data && doc.siteName){
        
        // build the emit key
        var dte = new Date(doc._id.replace(' ','T').split(',')[0]);
        
        emit(
          [dte.getFullYear(), dte.getMonth() + 1, dte.getDate(), dte.getHours(), dte.getMinutes(), dte.getSeconds()], 
          doc.data.ssPowerNowW - doc.data.ssFeedInPowerW
        );
    }
};


// map function: delta anomalies
var map_deltaAnomalies = function (doc) {
  
    if(doc.data && doc.siteName){
        
        if(doc.data.ssPowerNowW < doc.data.ssFeedInPowerW){
        // build the emit key
        var dte = new Date(doc._id.replace(' ','T').split(',')[0]);
        
        emit(
          [dte.getFullYear(), dte.getMonth() + 1, dte.getDate(), dte.getHours(), dte.getMinutes(), dte.getSeconds()], 
          doc.data.ssPowerNowW - doc.data.ssFeedInPowerW
        );
        }
    }
};


// tests
fs.readFile('example-1.json', function(err, data){ 
    map_consumedCost(JSON.parse(data));
    map_generatedCost(JSON.parse(data));
});
fs.readFile('example-2.json', function(err, data){ 
    map_consumedCost(JSON.parse(data));
    map_generatedCost(JSON.parse(data));
});
fs.readFile('example-3.json', function(err, data){ 
    map_consumedCost(JSON.parse(data));
    map_generatedCost(JSON.parse(data));
});


// TODO: Push this into GIT
