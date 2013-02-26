var url = require('url');
var idgen = require('idgen');

var dataAccess = require('../lib/DataAccessorFactory').build();

function keyGenFn(dataObject, callback) {
    callback(null, idgen(8));
}

function respondError(res, err) {
    res.json({ result: "Error", message: err });
}

function respondOk(res, dataObject) {
    res.json({ result: "OK", key: dataObject.key });
}

exports.register = function (app) {

    function validateUrl(inputUrl) {
        var protocol = url.parse(inputUrl).protocol;
        if (protocol == "http:" || protocol == "https:")
            return true;
        else
            return false;
    }

    function validateDate(date) {
        return !isNaN(date.valueOf());
    }

    app.post("/api/create", function (req, res) {
        var originalUrl = req.param('originalUrl'),
            expireAt = req.param('expireAt');
        
        console.log("originalUrl is: " + originalUrl);
        console.log("expireAt is: " + expireAt);
        
        if (typeof(expireAt) == "string") {
            expireAt = new Date(expireAt.trim());
        } else {
            expireAt = null;
        }
        
        if (!validateUrl(originalUrl)) {
            respondError(res, "The URL entered is invalid.");
        } else if (expireAt && !validateDate(expireAt)) {
            respondError(res, "The expiration date is invalid.");
        } else {
            var dataObject = {
                originalUrl: originalUrl
            };
            if (expireAt) {
                dataObject.expireAt = expireAt;
            }

            dataAccess.create(dataObject, keyGenFn, function (err, dataObject) {
                if (err) {
                    console.log(err);
                    respondError(res, "Server error.");
                } else {
                    respondOk(res, dataObject);
                }
            })
        }
    });
};