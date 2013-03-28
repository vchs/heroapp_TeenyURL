// This is the factory module to build the full stack for
// data access layer.

var RedisCacheProvider  = require("./RedisCacheProvider"),
    PersistentDbWrapper = require("./PersistentDbWrapper"),
    CacheDataAccessor   = require("./CacheDataAccessor"),
    duplicationFilter = require("./PostgresDuplicationFilter");

var dataAccessor;

exports.build = function () {
    if (!dataAccessor) {
        var connInfo = require('./ServiceBinding').postgres;
        dataAccessor = new CacheDataAccessor(new RedisCacheProvider(), 
                                             new PersistentDbWrapper.DataAccessor(PersistentDbWrapper.buildConn(connInfo, 'postgres'), duplicationFilter));
    }
    return dataAccessor;
};
