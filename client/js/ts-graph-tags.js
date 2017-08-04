/* global d3 */

function graphTags(el, fnItemClick, fnCallback){
    
    el = el || "div#sentiment-graph";
    
    var tagList = d3.select(el).append('ul');
    
    this.draw = function(data){
        var liList = tagList.selectAll('li')
              .data(data, function(d){return d;});
            
            // what to do when el < data
            liList.enter()
              .append('li')
              .text(function(d){return d;})
              .on('click', fnItemClick);
            
            // what to do when el > data
            liList.exit()
              .remove();

    }
}