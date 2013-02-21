var redis = require("redis");

var connInfo = {};
// TODO detect connInfo inside CloudFoundry
if (process.env.REDIS_CONN) {
    var url = require("url").parse(process.env.REDIS_CONN);
    connInfo.host = url.hostname;
    if (url.port) {
        connInfo.port = parseInt(url.port);
    }
    connInfo.auth = url.auth;
    if (url.path && url.path.length > 1) {
        connInfo.db = parseInt(url.path.substr(1));
    }
}

function logError(err) {
    if (err) {
        console.error("RedisError: " + err);
    }
}

function ensureCallback(callback) {
    return callback ? callback : function () { };
}

function connectRedis(callback) {
    callback = ensureCallback(callback);

    var client = redis.createClient(connInfo.port, connInfo.host);
    client.on("error", function (err) {
        logError(err);
        callback(err, client);
    }).on("ready", function () {
        if (connInfo.db) {
            client.select(connInfo.db, function (err, res) {
                logError(err);
                callback(err, client);
            });
        } else {
            callback(null, client);
        }
    });
    if (connInfo.auth) {
        client.auth(connInfo.auth);
    }
    return client;
}

exports.RedisCacheProvider = new Class({
    initialize: function (callback) {
        this._client = connectRedis(callback);
    },
    
    // implement ICacheProvider
    
    getValue: function (key, callback) {
        this._client.get(key, callback);
        return this;
    },
    
    setValue: function (key, value, expireAt, callback) {
        var expiration = expireAt instanceof Date ? Math.floor(expireAt.valueOf() / 1000) : null;
        if (value == null) {
            if (expiration) {
                this._client.expireat(key, expiration, callback);
            } else {
                this._client.persist(key, callback);
            }
        } else if (expiration) {
            this._client.multi()
                        .set(key, value)
                        .expireat(key, expiration)
                        .exec(callback);
        } else {
            this._client.set(key, value, callback);
        }
        return this;
    }
});
