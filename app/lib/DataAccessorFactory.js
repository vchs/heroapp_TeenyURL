module.exports = {
    build: function (){
        var mongoDataAccessor = new MongoDataAccessor();
        var redisCacheProvider = new RedisCacheProvider();

        return new CacheDataAccessor(redisCacheProvider, mongoDataAccessor);
    }
};