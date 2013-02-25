var service = require('../app/lib/ServiceBinding');
var expect = require('expect.js');
var th = require('./helpers');

th.when(service.redisCache && service.mongoDb)
  .describe("CacheDataAccessor.Functional", function () {
    var accessor;

    var LONG_URL = "www.vmware.com";
    var GENERATED_KEY = "xiaomaolv";

    var keyGenFunc = function (dataObject, callback) {
        callback(null, GENERATED_KEY);
    };

    before(function () {
        var CacheDataAccessor = require('../app/lib/CacheDataAccessor');
        var RedisCacheProvider = require('../app/lib/RedisCacheProvider');
        var MongoDBDataAccessor = require('../app/lib/MongoDBDataAccessor');
        var redisCacheProvider = new RedisCacheProvider();
        var mongoDBDataAccessor = new MongoDBDataAccessor();
        accessor = new CacheDataAccessor(redisCacheProvider, mongoDBDataAccessor);
    });

    describe("#create", function () {
        it("can create new tiny url", function (done) {
            var dataObject = {originalUrl: LONG_URL};
            accessor.create(dataObject, keyGenFunc, th.asyncExpect(function (err, retDataObject) {
                expect(err).to.be(null);
                expect(retDataObject.key).to.be(GENERATED_KEY);
            }, done));
        });
    });

    describe("#fetch", function () {
        it("can fetch the original url according to the tiny url", function (done) {
            var dataObject = {key: GENERATED_KEY};
            accessor.fetch(dataObject, keyGenFunc, th.asyncExpect(function (err, retDataObject) {
                expect(err).to.be(null);
                expect(retDataObject.originalUrl).to.be(LONG_URL);
            }, done));
        });
    });
});