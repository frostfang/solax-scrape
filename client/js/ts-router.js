/* global Backbone */

// AppRouter is used to route url hashes to application functions
// so changing the url hash will trigger events that do stuff
var AppRouter = Backbone.Router.extend({

    currentView: null,

    routes: {
        ':hashtag': 'urlhashchange'
    },
    
    urlhashchange: function(t){
        //console.log('routechange', arguments);
        this.trigger('routechange',t);
    },
    
    changeView: function(view) {
        if(null != this.currentView)
            this.currentView.undelegateEvents();
        this.currentView = view;
        this.currentView.render();
    },
    
    setTag: function(t){
        //console.log('setTag', arguments);
        this.navigate(t);
    }
});
