var MongoDbDataAccessor = require('./MongoDBDataAccessor');
var RedisCacheProvider = require('./RedisCacheProvider');
var CacheDataAccessor = require('./CacheDataAccessor');

module.exports = {
    build: function (){
        var mongoDbDataAccessor = new MongoDbDataAccessor();
        var redisCacheProvider = new RedisCacheProvider();

        return new CacheDataAccessor(redisCacheProvider, mongoDbDataAccessor);
    }
};