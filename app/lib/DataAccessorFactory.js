module.exports = {
    build: function (){
        var mongoDBDataAccessor = new MongoDBDataAccessor();
        var redisCacheProvider = new RedisCacheProvider();

        return new CacheDataAccessor(redisCacheProvider, mongoDBDataAccessor);
    }
};