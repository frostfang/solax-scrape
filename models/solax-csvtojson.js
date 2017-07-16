// This processes the scraped CSV file that comes from the website
var csvtojson = require("csvtojson");
var underscore = require('underscore');


module.exports = function(config, itemCB, doneCB) {
    
    //TODO: Add in Timezone stuff (maybe, Datetime will always be relative to the sun)
    
    var sitenameInCSV;
    
    csvtojson({
        noheader: true,
        headers: [
            "Last Updated",
            "PV1 Current (A)",
            "PV2 Current (A)", 
            "PV1 Voltage (V)", 
            "PV2 Voltage (V)", 
            "Output Current (A)", 
            "Network Voltage (V)", 
            "Power Now (W)", 
            "Feed In Power (W)", 
            "PV1 Input Power (W)", 
            "PV2 Input Power (W)", 
            "FAC1 (HZ)", 
            "Todays Energy (kWh)", // was Today's Energy (kWh), don't want apostraphe
            "Total Energy (kWh)"
        ]
    })
    .fromFile(config.filePath)
    .preFileLine(function(lStr, i){
        
        // get the sitename 
        // site name seems to always be the second column in the csv
        if(i===1)
            sitenameInCSV = lStr.split(",")[1];
        
        // ignore the first 5 rows because it just guff
        // empty strings don't reach the final object
        if (i<=5)
            return '';

        return lStr;
    })
    .transf(function(j,c,i){
        
        underscore.chain(j).keys().each(function(v){ 
            // create the new key by trimming characters and adding prefix
            var nk= "ss" + v.replace(/\s|[(]|[)]/g,"");
            
            // parse any float values
            if(isFloat(j[v])){
                j[nk] = parseFloat(j[v]);
                // j.ssCheckSum =  (j.ssCheckSum + j[nk]) || 0;
            }
            
            // parse any date values, for now just hardcode...
            if(v === "Last Updated"){
                var d = new Date(j[v]);
                j[nk] = d.toJSON();
                
                // adding these in for cdb indexing purposes
                j[nk + "Year"] = d.getFullYear();
                j[nk + "Month"] = (d.getMonth() + 1);
                j[nk + "Day"] = d.getDate();
                j[nk + "Hour"] = d.getHours();
                j[nk + "Minute"] = d.getMinutes();
                j[nk + "Second"] = d.getSeconds();
            }
            
        });
        
        
        function isFloat(s){
            return (!isNaN(s) && s.toString().indexOf('.') != -1);
        }
        
    })
    .on('json', function(j,i) {
    
        // emit the item callback
        if(itemCB)
            itemCB(j,sitenameInCSV,i);
       
    })
    .on('done', function(error) {
        if(doneCB)
            doneCB(error);
    });
    
};

