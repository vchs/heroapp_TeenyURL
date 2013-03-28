var asyncTry = require("./AsyncTryHelper");

var ShortUrl;

function initModel(conn, additionalMigrationCallback) {
    //No way to pass in unique_index in model, we will set that later.
    ShortUrl = conn.define("ShortUrl", {
        // the key generated uniquely for the original URL: http://teenyurl/key
        key: { type: String, "null": false },
        // the original URL the key mapped to
        originalUrl: { type:String, "null": false },
        // when the mapping expires
        expireAt: Date
    });
    ShortUrl.prototype.toDataObject = function () {
        return {
            key: this.key,
            originalUrl: this.originalUrl,
            expireAt: this.expireAt
        };
    };
    if (!conn.isActual()) {
        conn.autoupdate(function (err) {
            if (err) {
                console.error("error during migration" + err);
            } else {
              //migration successful
              if (additionalMigrationCallback)
                  additionalMigrationCallback();
            }
        });
    }
}

module.exports = {
  
  DataAccessor: new Class({

    initialize: function (conn, duplication_filter) {
        this.duplication_filter = duplication_filter;
        if (!ShortUrl) {
            initModel(conn, function () {
                //HACK!: create unique index via sql directly. Juggingdb's ORM impl doesn't support this right now.
                conn.adapter.command("CREATE UNIQUE INDEX ShortUrl_key_idx ON \"ShortUrl\" (key);", function(err) {
                    conn.adapter.command("CREATE UNIQUE INDEX ShortUrl_originalurl_idx ON \"ShortUrl\" (\"originalUrl\");", function(err) {
                    });
                });
           });
        }
    },

    // implement IDataAccessor

    create: function (dataObject, keyGenFn, callback) {
        if (dataObject.expireAt && dataObject.expireAt <= new Date()) {
            dataObject.key = "invalidExpireDate";
            callback(null, dataObject);
        }
        // when original URL already exists, only expiration is updated
        asyncTry(function (tries) {
            // first, check if original URL exists
            ShortUrl.findOne({ where: { originalUrl: dataObject.originalUrl} }, function (err, shortUrl) {
                if (err) {
                    tries.done(err);
                } else if (shortUrl) {
                    // original URL exists, update expiration only when necessary
                    dataObject.key = shortUrl.key;
                    if (shortUrl.expireAt != dataObject.expireAt) {
                        shortUrl.expireAt = dataObject.expireAt== undefined ? null : dataObject.expireAt;
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
                            dataObject.key = key
                            ShortUrl.create({
                                key: key,
                                originalUrl: dataObject.originalUrl,
                                expireAt: dataObject.expireAt == undefined ? null : dataObject.expireAt 
                            }, function (err) {
                                if (err) {
                                    if (duplication_filter && duplication_filter(err.code)) {
                                        // unique violation, this is possible if multiple clients
                                        // are creating the mappings for the same URL, need to retry.
                                        tries.retry();
                                    } else {
                                        //Don't try
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

    fetch: function (url_key, callback) {
        ShortUrl.findOne({ where: {key: url_key}}, function (err, shortUrl) {
            if (err || shortUrl == null) {
              callback(err, null);
            } else {
                if (shortUrl.expireAt && shortUrl.expireAt <= new Date()) {
                    callback(null, null);
                }
                else {
                   callback(null, shortUrl.toDataObject());  
                }
            }
        });
        return this;
    }
  }),
  buildConn:  function(connInfo, adapterName) {
        if (connInfo == null)
            throw new Error("Service binding is configured incorrectly.");
        var Schema = require("jugglingdb").Schema;
        return new Schema(adapterName, connInfo);
  }
}

