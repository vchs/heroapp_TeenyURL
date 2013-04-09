// The data accessor implementation backed by MongoDB

var mongoose = require("mongoose"),
    asyncTry = require("./AsyncTryHelper");

// Define model
var shortUrlSchema = new mongoose.Schema({
        // the key generated uniquely for the original URL: http://teenyurl/key
        key: { type: String, index: { unique: true, required: true } },
        // the original URL the key mapped to
        originalUrl: { type: String, index: { unique: true, required: true } },
        // when the mapping expires
        expireAt: Date
    },
    { id: false,  shardkey: { key: 1 } }    // "key" is used as "id"
);

// converting model to data object
shortUrlSchema.methods.toDataObject = function () {
    return {
        key: this.key,
        originalUrl: this.originalUrl,
        expireAt: this.expireAt
    };
};

var ShortUrl = mongoose.model("ShortUrl", shortUrlSchema, "shorturl");

var DUP_KEY_ERROR = 11000;  // the error code from MongoDB for key duplication error

module.exports = new Class({

    initialize: function (connInfo) {
        this.url = connInfo.url;
    },

    // implement IDataAccessor

    ready: function (callback) {
        mongoose.connect(this.url);
        callback();
    },
    
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
