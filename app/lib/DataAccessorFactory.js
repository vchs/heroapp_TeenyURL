module.exports = {
    build: function (){
        var mongoDbDataAccessor = new MongoDbDataAccessor();
        var redisCacheProvider = new RedisCacheProvider();

        return new CacheDataAccessor(redisCacheProvider, mongoDbDataAccessor);
    }
};