// This module routes the access to tiny URL by redirecting to
// the original URL.

var dataAccessor = require("../lib/DataAccessorFactory").build();

exports.register = function (app) {
    // The URL accessed will be http(s)://tinyurl(.domain)/key
    app.get("/:key", function (req, res) {
        var key = req.params.key;

        dataAccessor.fetch(key, function(err, dataObject){
            if (err) {
                console.error(err);
                res.send(500, "Server error.");
            } else if(dataObject){
                res.redirect(dataObject.originalUrl);
            } else {
                res.send(404, "Not found.")
            }
        });
    });
};