/* globals Backbone Mustache moment $ _ */

var Log = Backbone.Model.extend({
    url: '/log'
    // parse: function(res,opt){
    //     return res.rows;
    // }
});

var LogView = Backbone.View.extend({
    initialize: function(){
        this.template = $('#tpl-log').html();
        this.listenTo(this.model, 'change', this.render); 
    },
    render: function(){
        this.$el.html(Mustache.to_html(this.template, this.model.toJSON()));
        return this;
    }
});