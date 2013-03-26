// The data accessor implementation backed by MongoDB

var async = require("async"),
    ShortUrl = require("./models/ShortUrl");

var MAX_TRIES = 200;

// Wraps async while loop for retrying jobFn
// until succeeded, error encountered, or MAX_TRIES reached
function asyncTry (jobFn, callback) {
    // create an internal state for jobFn to report
    // - success done(null, result)
    // - failure done(err)
    // - retry   retry()
    var state = Object.create({
        retry: function () {
            this.tries ++;
            this.iterationDone();
        },
        
        done: function (err, result) {
            this.completed = true;
            this.result = result;
            this.iterationDone(err);
        }
    });
    
    // initialize the state
    state.tries = 0;
    state.completed = false;
    
    // start the while loop
    async.whilst(
        function () { return !state.completed && state.tries < MAX_TRIES; },
        function (iterationDone) {
            state.iterationDone = iterationDone;
            try {
                jobFn(state);
            } catch (err) {
                state.done(err);
            }
        },
        function (err) {
            callback(err, state.result, state.tries >= MAX_TRIES);
        }
    );
}

var connInfo;

function connectMongoDb() {
    if (!connInfo) {
        connInfo = require("./ServiceBinding").mongoDb;
        if (connInfo && connInfo.url) {
            require("mongoose").connect(connInfo.url);
        } else {
            throw new Error("No service binding for MongoDB");
        }        
    }
}

var DUP_KEY_ERROR = 11000;  // the error code from MongoDB for key duplication error

module.exports = new Class({

    initialize: function () {
        connectMongoDb();
    },

    // implement IDataAccessor

    create: function (dataObject, keyGenFn, callback) {
        // when original URL already exists, only expiration is updated
        asyncTry(function (tries) {
            // first, check if original URL exists
            ShortUrl.findOne({ originalUrl: dataObject.originalUrl }, function (err, shortUrl) {
                if (err) {
                    tries.done(err);
                } else if (shortUrl) {
                    // original URL exists, update expiration only when necessary
                    dataObject.key = shortUrl.key;
                    if (shortUrl.expireAt != dataObject.expireAt) {
                        shortUrl.expireAt = dataObject.expireAt;
                        shortUrl.save(function (err) {
                            if (err) {
                                tries.done(err);
                            } else {
                                tries.done(null, dataObject);
                            }
                        })
                    } else {
                        tries.done(null, dataObject);
                    }
                } else {
                    // add a new mapping, generate key first
                    keyGenFn(dataObject, function (err, key) {
                        if (err) {
                            tries.done(err);
                        } else {
                            dataObject.key = key;
                            ShortUrl.create({
                                key: key,
                                originalUrl: dataObject.originalUrl,
                                expireAt: dataObject.expireAt
                            }, function (err) {
                                if (err) {
                                    if (err.code == DUP_KEY_ERROR) {
                                        // key duplicated, this is possible if multiple clients
                                        // are creating the mappings for the same URL, need to retry.
                                        tries.retry();
                                    } else {
                                        // trivil error
                                        tries.done(err);
                                    }
                                } else {
                                    // mapping created
                                    tries.done(null, dataObject);
                                }
                            });
                        }
                    });
                }
            });
        }, function (err, dataObject, givenUp) {
            if (err) {
                callback(err);
            } else if (givenUp) {
                callback(new Error("Maximum retry limit reached, give up."));
            } else {
                callback(null, dataObject);
            }
        });
        return this;
    },

    fetch: function (key, callback) {
        ShortUrl.findOne({
            key: key,
            $or: [
                { expireAt: null },
                { expireAt: undefined },
                { expireAt: { $gte: new Date() } }
            ]
        }, function (err, shortUrl) {
            callback(err, !err && shortUrl ? shortUrl.toDataObject() : null);
        });
        return this;
    }
});
