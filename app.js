// This is the main TeenyUrl app module

require('mootools');

var express = require('express');
var path = require('path');

var app = express();

app.configure('development', function () {
    app.use(express.logger('dev'));    
});

app.configure(function() {
    app.use(express.favicon(path.join(__dirname, '/public/img/favicon.ico')));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function() {
    app.use(express.errorHandler());
});

require('./lib/DataAccessorFactory').build(function (err, dataAccessor) {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    
    require('./routes/api').register(app, dataAccessor);
    require('./routes/redirect').register(app, dataAccessor);
    
    // environment variable VCAP_APP_PORT will be defined when the app is
    // running on Tempest cloud. The app must listen on this port otherwise
    // the requests can't be routed.
    var port = process.env.VCAP_APP_PORT || 3000;
    app.listen(port, function() {
        console.log("TeenyUrl is listening on port " + port);
    });
});    