// This module implements a cache provider based on Redis

var redis = require("redis");

function logError(err) {
    if (err) {
        console.error("RedisError: " + err);
    }
}

function connectRedis(connInfo) {
    var client = redis.createClient(connInfo.port, connInfo.host);
    client.on("error", function (err) {
        logError(err);
    }).on("ready", function () {
        // disable persistency as Redis is only used for caching
        client.config("set", "save", "", function () { });
    });

    if (connInfo.password) {
        client.auth(connInfo.password);
    }
    return client;
}

module.exports = new Class({

    initialize: function (connInfo) {
        this.client = connectRedis(connInfo);
    },
    
    // implement ICacheProvider
    
    getValue: function (key, callback) {
        this.client.get(key, callback);
        return this;
    },
    
    setValue: function (key, value, expireAt, callback) {
        // fixup expireAt on seconds
        var expiration = expireAt instanceof Date ? Math.floor(expireAt.valueOf() / 1000) : null;
        if (value == null) {        // only update expiration
            if (expiration) {
                this.client.expireat(key, expiration, callback);
            } else {                // set expiration to null for being never expired
                this.client.persist(key, callback);
            }
        } else if (expiration) {    // update value and expiration
            // this should be done with MULTI for consistency
            this.client.multi()
                        .set(key, value)
                        .expireat(key, expiration)
                        .exec(callback);
        } else {                    // update value which never expires
            this.client.set(key, value, callback);
        }
        return this;
    }
});
