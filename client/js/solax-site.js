/* global Backbone SearchView CostView Consumption Generation Search AppRouter Log LogView _ $ */

// TODO: change this

// main
$(function() {

    // defaults
    var defaultPeriod = 5
    var defaultEndDate = new Date();
    var defaultStartDate = new Date();
    defaultStartDate.setDate(defaultEndDate.getDate() - defaultPeriod);

    // Models
    var search = new Search({ StartDate: defaultStartDate, EndDate: defaultEndDate });
    var consumption = new Consumption({StartDate: defaultStartDate, EndDate: defaultEndDate });
    var generation = new Generation({StartDate: defaultStartDate, EndDate: defaultEndDate });
    var log = new Log();
    
    // Views
    var logview = new LogView({ el:'#log-history', model: log });
    var searchview = new SearchView({ el: '#searchview', model: search });
    var consumptionview = new CostView({ el: '#consumptionview', model: consumption });
    var generationview = new CostView({ el: '#generationview', model: generation });
    consumptionview.title = 'Consumption';
    generationview.title = 'Generation';
    
    // Client Router
    var approuter = new AppRouter();
    
    // events
    Backbone.listenTo(search, 'change', function(){   
        consumption.set(search.pick('StartDate','EndDate')).fetch();
        generation.set(search.pick('StartDate','EndDate')).fetch(); 
    });
    // Events
    // approuter.listenTo(tagsearchview, 'tagchanged', function(t){ 
    //     approuter.setTag(t);
    // });
    // tagsearchview.listenTo(approuter, 'routechange', function(t){ 
    //     tagsearch.set({ tag:t, active:true });
    // });
    // Backbone.listenTo(tagsearchview, 'tagchanged', function(t){
    //     // emit the change to the socket
    //     socket.emit('client.changetag', t);
    // });
    
    // // sentiment changes
    // socket.on('client.sentiment', function(data){
    //     // update the graph
    //     gs.draw(data.sentimentsummary);
    // });
    
    // // tag changes
    // socket.on('client.tags', function(data) {
    //     // update the tags collection
    //     tags.bulkchange(data);
    //     // TODO: this isn't the place to change the selected state on the nav, 
    //     // you need both this and the view/model
    // });
    
    // // handle the server dropping out and reconnecting
    // socket.on('reconnect', function(num) {
    //     // trigger a change to kick of the socket events
    //     tagsearchview.tagChanged();
        
    //     // essentially restart the client to get the relevant stuff
    //     socket.emit('client.ready');
    // });
    
    
    // ----- app start
    // Render the static controls
    searchview.render();
    
    // start the app
    Backbone.history.start();
    consumption.fetch();
    generation.fetch();
    log.fetch();

});