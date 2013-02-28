// This module implements a cache provider based on Redis

var redis = require("redis");

function logError(err) {
    if (err) {
        console.error("RedisError: " + err);
    }
}

function connectRedis(callback) {
    // make a dummy callback if not provided
    if (!callback) {
        callback = function () { };
    }

    var connInfo = require("./ServiceBinding").redisCache;
    if (!connInfo) {
        throw new Error("No service binding for Redis cache.");
    }

    var client = redis.createClient(connInfo.port, connInfo.host);
    client.on("error", function (err) {
        logError(err);
        callback(err, client);
    }).on("ready", function () {
        // disable persistency as Redis is only used for caching
        client.config("set", "save", "", function () {
            // ignore the error disabling persistency
            callback(null, client);
        });
    });

    if (connInfo.password) {
        client.auth(connInfo.password);
    }
    return client;
}

module.exports = new Class({

    initialize: function (callback) {
        this.client = connectRedis(callback);
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
