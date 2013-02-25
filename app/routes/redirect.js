var DataAccessorFactory = require('../lib/DataAccessorFactory');

exports.register = function (app) {
    app.get("/:key", function (req, res) {
        var key = req.params.key;
        console.log("key is: " + key);
        var dataAccessor = DataAccessorFactory.build();

        dataAccessor.fetch(key, function(err, dataObject){
            if (err != null) {
                console.log(err);
                res.send(500, "Server error.");
            } else if(dataObject){
                res.redirect(dataObject.originalUrl);
            } else {
                res.send(404, "Not found.")
            }
        });
    });
};