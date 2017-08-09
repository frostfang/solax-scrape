/* global d3 Backbone graphSentiment graphTags Tags TagSearch TagSearchView TagsView AppRouter io _ $ */

// TODO: change this

// main
$(function() {

    // Socket
    var socket = io();

    // Models
    var tagsearch = new TagSearch({ active: false });
    var tags = new Tags();
    
    // Views
    var tagsearchview = new TagSearchView({ el: '#tagsearch', model: tagsearch });
    var tagsview = new TagsView({ el: '#tags', collection: tags });
    var approuter = new AppRouter();
    var gs = new graphSentiment(500, 400, 'div#sentiment-graph');
    
    // Events
    approuter.listenTo(tagsearchview, 'tagchanged', function(t){ 
        approuter.setTag(t);
    });
    tagsearchview.listenTo(approuter, 'routechange', function(t){ 
        tagsearch.set({ tag:t, active:true });
    });
    Backbone.listenTo(tagsearchview, 'tagchanged', function(t){
        // emit the change to the socket
        socket.emit('client.changetag', t);
    });
    
    // sentiment changes
    socket.on('client.sentiment', function(data){
        // update the graph
        gs.draw(data.sentimentsummary);
    });
    
    // tag changes
    socket.on('client.tags', function(data) {
        // update the tags collection
        tags.bulkchange(data);
        // TODO: this isn't the place to change the selected state on the nav, 
        // you need both this and the view/model
    });
    
    // handle the server dropping out and reconnecting
    socket.on('reconnect', function(num) {
        // trigger a change to kick of the socket events
        tagsearchview.tagChanged();
        
        // essentially restart the client to get the relevant stuff
        socket.emit('client.ready');
    });
    
    
    // ----- app start
    // Render the static controls
    tagsearchview.render();
    gs.draw([0, 1, 0]);
    
    // start the app
    Backbone.history.start();
    //tags.fetch();
    socket.emit('client.ready');


});