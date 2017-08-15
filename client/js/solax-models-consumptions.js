/* globals Backbone Mustache $ */

var Cost = Backbone.Model.extend({
    dateToArrayString: function(d){
        // return "[" + d.toJSON().slice(0,19).replace(/-|T|:/g,",") + "]";
        
        return "[" + d.getFullYear() + "," + (d.getMonth() + 1) + "," + d.getDate() + 
                "," + d.getHours() + "," + d.getMinutes() + "," + d.getSeconds() + "]";
    },
    url: function(){
        return '/cost/' + this.costtype + '/' + this.dateToArrayString(this.get('StartDate')) + '-' + this.dateToArrayString(this.get('EndDate'));
    },
    parse: function(res,opt){
        res.data.mean = res.data.sum / res.data.count;
        res.data.std = (res.data.sumsqr / res.data.count) - (res.data.mean * res.data.mean);
        return res;
    }
});

var CostView = Backbone.View.extend({
    initialize: function(){
        this.template = $('#tpl-cost').html();
        this.listenTo(this.model, 'change', this.render); 
    },
    render: function(){
        var m = this.model.toJSON();
        m.title = this.title; // add in the view title
        
        this.$el.html(Mustache.to_html(this.template, m));
        return this;
    }
    
    // TODO: add in a renderer to floor the long numbers
    // TODO: add in the generation models as well. Maybe abstract to a generic object.
    
});


var Consumption = Cost.extend({
   costtype: 'consumedCost'
});

var Generation = Cost.extend({
    costtype: 'generatedCost'
});
