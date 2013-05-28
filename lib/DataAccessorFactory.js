// This is the factory module to build the full stack for
// data access layer.

exports.build = function (done) {
    var services = require("./ServiceBinding");
    // create persisted data accessor
    var persistedDataAccessor;
    if (services.postgres) {
        var DataAccessorClass = require("./SqlDataAccessor");
        persistedDataAccessor = new DataAccessorClass("postgres", services.postgres);
    } else if (services.mongoDb) {
        var DataAccessorClass = require("./MongoDbDataAccessor");
        persistedDataAccessor = new MongoDbDataAccessor(services.mongoDb);
    } else {
        done(new Error("No persisted storage binding found!"));
    }
    
    var dataAccessor
    // create cache layer if Redis is available
    if (services.redisCache) {
        var CacheDataAccessor = require("./CacheDataAccessor");
        var RedisCacheProvider = require("./RedisCacheProvider");
        dataAccessor = new CacheDataAccessor(new RedisCacheProvider(services.redisCache), persistedDataAccessor);
    } else {
        // no cache layer available, return persisted layer directly
        dataAccessor = persistedDataAccessor;
    }
    
    if (persistedDataAccessor.ready) {
        persistedDataAccessor.ready(function (err) {
            done(err, dataAccessor);
        });
    } else {
        done(err, dataAccessor);
    }
};
