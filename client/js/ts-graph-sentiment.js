/* global d3 */

// graphs the sentiment to a given element, you need to pass an element for the 
// graphic to be bound to and a height and width. 
// Requires D3 and JQuery
function graphSentiment(width, height, el, fnCallback){

    // setup some restrictions, might also be worth making the height and 
    // width responsive to screen size
    width = width || 500;
    height = height || 400;
    el = el || "div#sentiment-graph";

    var radius = Math.min(width, height) / 2; // ensure the radius is within our dimensions
    
    // the color ordinal
    var pieColor = d3.scale.ordinal().range(["#ff7f0e","#1f77b4","#2ca02c",'#7f7f7f']);
    
    // layout.pie is convenience fn that does fancy stuff to your data
    var pie = d3.layout.pie()
        .value(function(d) { return d; }) // you don't need this fn because you have the data how you want
        //.value(function(d) { return d[0]; }) // you don't need this fn because you have the data how you want
        .sort(null); // this is saying don't sort the data
    
    // TODO: see if you can use the arc width to display magnitude of pos/neg comments
    // define an arc to be used by the pie chart
    var arc = d3.svg.arc()
        .innerRadius(radius - 100)
        //.outerRadius(function(d){ console.log(d); return radius - d.data[1]; });
        .outerRadius(radius - 20);
        //.startAngle(function(d) { return d.startAngle + Math.PI; }) //moves it to 180
        //.endAngle(function(d) { return d.endAngle + Math.PI; });
        
    // This is getting the panel for the graph
    var svg = d3.select(el).append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")        // TODO: what does g do ?
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
    
    // setup the initial graph variable, relys on svg
    var path;
    
    // Store the displayed angles in _current.
    // Then, interpolate from _current to the new angles.
    // During the transition, _current is updated in-place by d3.interpolate.
    function arcTween(a) {
        var i = d3.interpolate(this._current, a);
        this._current = i(0);
        return function(t) {
            return arc(i(t));
        };
    }

    // This combines the inital and transition methods in [ts-graph-sentiment.js.old]
    // basically i wasnt calling and assigning the methods properly in the
    // above methods. You can't chain exit(), enter() together
    // There is an art to writing d3 objects
    this.draw = function(data){
        // data = [[1,1],[1,20],[1,40]];
        path = svg.selectAll("path").data(pie(data));
        
        path.enter()
            .append("path")
            .attr("fill", function(d, i) {
                return pieColor(i);
            })
            .attr("d", arc)
            .each(function(d) {
                this._current = d;
            }); // store the initial angles
        
        path.transition().duration(750).attrTween("d", arcTween); // redraw the arcs
    };

}