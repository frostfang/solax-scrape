/* globals Backbone Mustache $ _ */

var Search = Backbone.Model.extend({});

// TODO: establish default date

var SearchView = Backbone.View.extend({
    initialize: function(){
        this.template = $('#tpl-search').html();
        this.listenTo(this.model, 'change', this.render);
    },
    events:{
        'click #test': 'goClick',
        'change .date': 'inputChange'
    },
    goClick: function(ev){
        console.log('clicked');
        var ed = new Date();
        var sd = new Date();
        sd.setDate(ed.getDate()-5);
        
        this.model.set({
            StartDate: sd,
            EndDate: ed,
        });

    },
    inputChange: function(ev){
        var t = $(ev.currentTarget).val();
        console.log(t);
        // if(t != this.model.get('tag')){
        //     this.model.set({ tag: t, previousTag: this.model.get('tag'), active: (t.length > 0) });
        // }
    },
    render: function(){
        // transfor the range dates to html5 date strings
        var o = this.model.toJSON();
        
        if(o.StartDate)
            o.StartDateString = o.StartDate.toJSON().slice(0,16);
        
        if(o.EndDate)
            o.EndDateString = o.EndDate.toJSON().slice(0,16);
            
        this.$el.html(Mustache.to_html(this.template, o));
        
        //this.$btnGo = this.$el.find('.go');
        this.$sDte = this.$el.find('#dtlStartDate');
        this.$eDte = this.$el.find('#dtlEndDate');
        return this;
    }
});