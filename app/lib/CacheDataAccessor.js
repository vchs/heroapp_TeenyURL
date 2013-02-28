// This module implements general caching logic

// CacheDataAccessor requires a cache provider and a lower-level data accessor.
// For "fetch", it checks the cache with cache provider, and invokes lower-level
// data accessor if missed. For "create", it invokes lower-level data accessor
// directly, and puts the result in cache by cache provider before return.
module.exports = new Class({

    initialize: function (cacheProvider, dataAccessor) {
        this.cacheProvider = cacheProvider;
        this.dataAccessor  = dataAccessor;
    },

    // implement IDataAccessor

    create: function (dataObject, keyGenFn, callback) {
        var self = this;
        this.dataAccessor.create(dataObject, keyGenFn, function (err, createdDataObject) {
            self.updateCache(err, createdDataObject, callback);
        });
        return this;
    },

    fetch: function (key, callback) {
        var self = this;
        this.cacheProvider.getValue(key, function (err, value) {
            if (value == null || value == undefined) {    // missed
                self.dataAccessor.fetch(key, function (err, dataObject) {
                    self.updateCache(err, dataObject, callback);
                });
            } else {
                var dataObject = { key: key, originalUrl: value };
                callback(err, dataObject);
            }
        });
        return this;
    },
    
    // privates

    updateCache: function (err, dataObject, callback) {
        if (!err && dataObject) {
            // ignore the result for caching
            this.cacheProvider.setValue(dataObject.key, dataObject.originalUrl, dataObject.expireAt);
        }
        callback(err, dataObject);
    }
});
