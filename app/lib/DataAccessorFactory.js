// This is the factory module to build the full stack for
// data access layer.

var RedisCacheProvider  = require("./RedisCacheProvider"),
    PostgresConnBuilder = require("./PostgresConnBuilder"),
    PersistentDbDataAccessor = require("./PersistentDbDataAccessor"),
    CacheDataAccessor   = require("./CacheDataAccessor");

var dataAccessor;

exports.build = function () {
    if (!dataAccessor) {
        dataAccessor = new CacheDataAccessor(new RedisCacheProvider(), new PersistentDbDataAccessor(PostgresConnBuilder()));
    }
    return dataAccessor;
};
