// This is the factory module to build the full stack for
// data access layer.

var MongoDbDataAccessor = require("./MongoDbDataAccessor"),
    RedisCacheProvider  = require("./RedisCacheProvider"),
    CacheDataAccessor   = require("./CacheDataAccessor");

var dataAccessor;

exports.build = function () {
    if (!dataAccessor) {
        dataAccessor = new CacheDataAccessor(new RedisCacheProvider(), new MongoDbDataAccessor());
    }
    return dataAccessor;
};
