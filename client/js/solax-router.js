/* global Backbone */

// AppRouter is used to route url hashes to application functions
// so changing the url hash will trigger events that do stuff
var AppRouter = Backbone.Router.extend({

    currentView: null,

    routes: {
        ':datechange': 'dateRangeChange'
    },
    
    dateRangeChange: function(i){
        //console.log('routechange', arguments);
        this.trigger('datechange',i);
    },
    
    changeView: function(view) {
        if(null != this.currentView)
            this.currentView.undelegateEvents();
        this.currentView = view;
        this.currentView.render();
    },
    
    setRange: function(i){
        //console.log('setTag', arguments);
        this.navigate(i);
    }
});
