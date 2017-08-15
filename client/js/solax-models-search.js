/* globals Backbone Mustache moment $ _ */

var Search = Backbone.Model.extend({});


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
        
        var sd = new Date(this.$sDte.val());
        var ed = new Date(this.$eDte.val());
        
        this.model.set({
            StartDate: sd,
            EndDate: ed,
        });

    },
    inputChange: function(ev){
        var t = $(ev.currentTarget).val();
        // if(t != this.model.get('tag')){
        //     this.model.set({ tag: t, previousTag: this.model.get('tag'), active: (t.length > 0) });
        // }
    },
    render: function(){
        console.log('render');
        // transfor the range dates to html5 date strings
        var o = this.model.toJSON();
        
        if(o.StartDate)
            o.StartDateString = moment(o.StartDate).format("YYYY-MM-DDTHH:mm");
        
        if(o.EndDate)
            o.EndDateString = moment(o.EndDate).format("YYYY-MM-DDTHH:mm");
            
        this.$el.html(Mustache.to_html(this.template, o));
        
        //this.$btnGo = this.$el.find('.go');
        this.$sDte = this.$el.find('#dtlStartDate');
        this.$eDte = this.$el.find('#dtlEndDate');
        return this;
    }
});