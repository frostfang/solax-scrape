/* globals Backbone Mustache */

var TagSearch = Backbone.Model.extend({});

var TagSearchView = Backbone.View.extend({
    initialize: function(){
        this.template = $('#tpl-tagsearch').html();
        this.listenTo(this.model, 'change', this.modelChanged);
        this.listenTo(this.model, 'change:tag', this.tagChanged);
    },
    events:{
        'click .go': 'goClick',
        'change .taginput': 'inputChange'
    },
    tagChanged: function(){
        this.trigger('tagchanged',this.model.get('tag'));
    },
    modelChanged: function(){
        this.$iTag.val(this.model.get('tag'));
        this.$btnGo.toggleClass('active', this.model.get('active'));
    },
    goClick: function(ev){
        this.model.set('active', !this.model.get('active'));
    },
    inputChange: function(ev){
        var t = $(ev.currentTarget).val();
        
        if(t != this.model.get('tag')){
            this.model.set({ tag: t, previousTag: this.model.get('tag'), active: (t.length > 0) });
        }
    },
    render: function(){
        this.$el.html(Mustache.to_html(this.template, { model: this.model.toJSON() }));
        this.$btnGo = this.$el.find('.go');
        this.$iTag = this.$el.find('.taginput');
        return this;
    }
});