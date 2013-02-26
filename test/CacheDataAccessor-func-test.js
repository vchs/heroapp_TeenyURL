var service = require('../app/lib/ServiceBinding');
var expect = require('expect.js');
var th = require('./helpers');

th.when(service.redisCache && service.mongoDb).describe("CacheDataAccessor.Functional", function () {
    var accessor;

    var VMWARE = "www.vmware.com";
    var GITHUB = "github.com";
    var GOOGLE = "www.google.com";
    var TAOBAO = "www.taobao.com";

    var newKeyGenFunc = function (key) {
        var retFunc = function(dataObject, callback) {
            callback(null, key);
        };
        return retFunc;
    };

    before(function () {
        var CacheDataAccessor = require('../app/lib/CacheDataAccessor');
        var RedisCacheProvider = require('../app/lib/RedisCacheProvider');
        var MongoDbDataAccessor = require('../app/lib/MongoDbDataAccessor');
        var redisCacheProvider = new RedisCacheProvider();
        var mongoDbDataAccessor = new MongoDbDataAccessor();
        accessor = new CacheDataAccessor(redisCacheProvider, mongoDbDataAccessor);
    });

    describe("#create", function () {
        it("can create new tiny url", function (done) {
            var dataObject = {originalUrl: VMWARE};
            var key = "vmware";
            var keyGenFunc = newKeyGenFunc(key);
            accessor.create(dataObject, keyGenFunc, th.asyncExpect(function (err, retDataObject) {
                expect(err).to.be(null);
                expect(retDataObject.key).to.be(key);
            }, done));
        });

        it("can create new tiny url with expired time", function (done) {
            var expireAtDate = new Date(Date.now());
            var key = "github";
            var keyGenFunc = newKeyGenFunc(key);
            var dataObject = {originalUrl: GITHUB, expireAt: expireAtDate};
            accessor.create(dataObject, keyGenFunc, th.asyncExpect(function (err, retDataObject) {
                expect(err).to.be(null);
                expect(retDataObject.key).to.be(key);
                expect(retDataObject.expireAt).to.be(expireAtDate);
            }, done));
        });

        it("can update one tiny url expire time", function (done) {
            var expireAtDate = new Date(Date.now());
            var key = "vmware";
            var keyGenFunc = newKeyGenFunc(key);
            var dataObject = {originalUrl: VMWARE, expireAt: expireAtDate};
            accessor.create(dataObject, keyGenFunc, th.asyncExpect(function (err, retDataObject) {
                expect(err).to.be(null);
                expect(retDataObject.key).to.be(key);
                expect(retDataObject.expireAt).to.be(expireAtDate);
            }, done));
        });
    });

    describe("#fetch", function () {

        it("can fetch the original url according to the tiny url", function (done) {
            var dataObject = {originalUrl: GOOGLE};
            var key = "google";
            var keyGenFunc = newKeyGenFunc(key);
            accessor.create(dataObject, keyGenFunc, th.asyncExpect(function (err, retDataObject) {
                expect(err).to.be(null);
                expect(retDataObject.key).to.be(key);
                accessor.fetch(key, th.asyncExpect(function (err, retDataObject) {
                    expect(err).to.be(null);
                    expect(retDataObject.originalUrl).to.be(GOOGLE);
                }, done));
            }, done, true));
        });

        it("can fetch undefined value for the expired key", function (done) {
            var expireAtData = new Date(Date.now() - 1000);
            var dataObject = {originalUrl: GOOGLE, expireAt: expireAtData};
            var key = "google";
            var keyGenFunc = newKeyGenFunc(key);
            accessor.create(dataObject, keyGenFunc, th.asyncExpect(function (err, retDataObject) {
                expect(err).to.be(null);
                expect(retDataObject.key).to.be(key);
                accessor.fetch(key, th.asyncExpect(function (err, retDataObject) {
                    expect(err).to.be(null);
                    expect(retDataObject.value).to.be(undefined);
                }, done));
            }, done, true));
        });
    });
});
