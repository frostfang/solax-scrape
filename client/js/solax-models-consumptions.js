/* globals Backbone Mustache $ */

var Consumption = Backbone.Model.extend({
    url: function(){
        return '/consumption?s=' + this.dateToArrayString(this.get('StartDate')) + '&e=' + this.dateToArrayString(this.get('EndDate'));
    },
    dateToArrayString: function(d){
        // return "[" + d.toJSON().slice(0,19).replace(/-|T|:/g,",") + "]";
        
        return "[" + d.getFullYear() + "," + (d.getMonth() + 1) + "," + d.getDate() + 
                "," + d.getHours() + "," + d.getMinutes() + "," + d.getSeconds() + "]";
    },
    parse: function(res,opt){
        res.data.mean = res.data.sum / res.data.count;
        res.data.std = (res.data.sumsqr / res.data.count) - (res.data.mean * res.data.mean);
        return res;
    }
});

var ConsumptionView = Backbone.View.extend({
    initialize: function(){
        this.template = $('#tpl-consupmtion').html();
        this.listenTo(this.model, 'change', this.render); 
    },
    // events:{
    //     'click .tag': 'tagClick'
    // },
    // tagClick: function(ev){
    //     var tag = $(ev.currentTarget).text();
    //     // remove active state
    //     this.collection.forEach(function(i){ i.set({ active: false }); });
    //     // set the active tag
    //     this.collection.findWhere({ tagname: tag}).set({ active: true });
        
    //     this.render();
    //     this.trigger('tagselected', tag);
    // },
    render: function(){
        this.$el.html(Mustache.to_html(this.template, this.model.toJSON()));
        return this;
    }
    
    // TODO: add in a renderer to floor the long numbers
    // TODO: add in the generation models as well. Maybe abstract to a generic object.
    
});