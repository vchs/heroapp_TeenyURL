// This module exposes TeenyUrl APIs for creating
// a new mapping between a shortened URL and an original one.

var url = require("url"),
    idgen = require("idgen");

// build the data accessing layer here.
var dataAccess = require("../lib/DataAccessorFactory").build();

/** Shortened URL key generation function
 * This function will be invoked by data accessing layer
 * when a new URL key (http://teenyurl/<URL key>) is needed.
 * This happens when the mapping to original URL doesn't exist.
 *
 * This function is designed to be invoked asynchronously because
 * we can replace this simple logic with more a complicated one which
 * may probably run asynchronously.
 * 
 * @param dataObject
 *         The object passed from the request.
 *         "dataObject.originalUrl" can be used to get the original URL.
 * @param {function (err, key)} callback
 *         This is the function to be invoked when the key is generated.
 *         When succeeded, "err" is null, "key" stores the generated key;
 *         otherwise, "err" is an error object, "key" is undefined.
 */
function keyGenFn(dataObject, callback) {
    callback(null, idgen(8));
}

// helper functions below

function respondError(res, err) {
    res.json({ result: "Error", message: err });
}

function respondOk(res, dataObject) {
    res.json({ result: "OK", key: dataObject.key });
}

// registers URL patterns for routing
exports.register = function (app) {

    // a simple check to ensure the submitted URL is valid
    function validateUrl(inputUrl) {
        var protocol = url.parse(inputUrl).protocol;
        if (protocol == "http:" || protocol == "https:")
            return true;
        else
            return false;
    }

    // a simple check to ensure the submitted expireAt is valid
    function validateDate(date) {
        // "new Date(...)" doesn't throw if the string doesn't represent
        // a valid date string, but "valueOf()" will be NaN.
        return !isNaN(date.valueOf());
    }

    // API to create a mapping between a URL key and the original URL.
    //
    // The payload should be of "application/x-www-form-urlencoded", and embedds two parameters:
    // - originalUrl: the original URL
    // - expireAt: (optional) the expiration time encoded in ISO8601 standard
    //
    // The response is in "application/json":
    // {
    //     "result": "OK" for success, "Error" for failure
    //     "key": generated key, only present when "result" is "OK"
    //     "message": error message when "result" is "Error"
    // }
    //
    // Note: when the original URL is already mapped, the mapped key is returned
    // immediately instead of creating a new key.
    app.post("/api/create", function (req, res) {
        var originalUrl = req.param("originalUrl"),
            expireAt = req.param("expireAt");

        // if "expireAt" is present, parse the time
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
            // construct a data object
            var dataObject = {
                originalUrl: originalUrl
            };
            if (expireAt) {
                dataObject.expireAt = expireAt;
            }

            dataAccess.create(dataObject, keyGenFn, function (err, dataObject) {
                if (err) {
                    console.error(err);
                    respondError(res, "Server error.");
                } else {
                    respondOk(res, dataObject);
                }
            })
        }
    });
};