require('mootools');

var express = require('express');

var app = express();

app.configure(function() {
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(require('path').join(__dirname, 'public')));
});

app.configure('development', function() {
    app.use(express.errorHandler());
});

require('./lib/api').register(app);

var port = process.env.VMC_APP_PORT || 3000;
app.listen(port, function() {
    console.log("TinyUrl listening on port " + port);
});
