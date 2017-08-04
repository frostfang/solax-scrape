/* globals Backbone Mustache */

var Tag = Backbone.Model.extend({
    idAttribute: 'tagname'
});

var Tags = Backbone.Collection.extend({
    model: Tag,
    bulkchange: function(tags){
        var selectedTag;
        if(this.findWhere({active: true}))
           selectedTag = this.findWhere({active: true}).get('tagname');
            
        this.reset();
        this.add(tags);
        
        if(selectedTag)
            this.findWhere({ tagname: selectedTag }).set({ active: true });
            
        this.trigger('bulkchange');
    }
});

var TagsView = Backbone.View.extend({
    initialize: function(){
        this.template = $('#tpl-tags').html();
        this.listenTo(this.collection, 'bulkchange', this.render); 
    },
    events:{
        'click .tag': 'tagClick'
    },
    tagClick: function(ev){
        var tag = $(ev.currentTarget).text();
        // remove active state
        this.collection.forEach(function(i){ i.set({ active: false }); });
        // set the active tag
        this.collection.findWhere({ tagname: tag}).set({ active: true });
        
        this.render();
        this.trigger('tagselected', tag);
    },
    render: function(){
        this.$el.html(Mustache.to_html(this.template, { tags: this.collection.toJSON() }));
        return this;
    }
});