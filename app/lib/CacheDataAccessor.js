exports.CacheDataAccessor = new Class({

    initialize: function (cacheProvider, dataAccessor){
        this._cacheProvider = cacheProvider;
        this._dataAccessor  = dataAccessor;
    },

    // implements IDataAccessor

    create: function (dataObject, keyGen, callback) {
        var self = this;
        self._dataAccessor.create(dataObject, keyGen, function(err, createdDataObject){
            if (err != null){
                callback(err);
            }else{
                self._cacheProvider.setValue(createdDataObject.key, createdDataObject.value, createdDataObject.expireAt);
                callback(err, createdDataObject);
            }
        });
    },

    fetch: function (key, callback) {
        var self = this;
        self._cacheProvider.getValue(key, function(err, value){
            if (value == null){
                self._dataAccessor.fetch(key, callback);
            }else{
                var dataObject = {};
                dataObject.key = key;
                dataObject.originalurl = value;
                callback(err, dataObject);
            }
        });
    }
});