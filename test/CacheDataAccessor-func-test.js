var expect = require("expect.js"),
    service = require("../app/lib/ServiceBinding"),
    th = require("./helpers");

th.when(service.redisCache && service.postgres)
  .describe("CacheDataAccessor.Functional", function () {

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

    var accessor;
    
    before(function () {
        accessor = require("../app/lib/DataAccessorFactory").build();
    });

    describe("#create", function () {
        it("can create new short url", function (done) {
            var dataObject = { originalUrl: VMWARE };
            var key = "vmware";
            var keyGenFunc = newKeyGenFunc(key);
            accessor.create(dataObject, keyGenFunc, th.asyncExpect(function (err, retDataObject) {
                expect(err).to.be(null);
                expect(retDataObject.key).to.be(key);
            }, done));
        });

        it("can create new short url with expired time", function (done) {
            var expireAtDate = new Date(Date.now());
            var key = "github";
            var keyGenFunc = newKeyGenFunc(key);
            var dataObject = { originalUrl: GITHUB, expireAt: expireAtDate };
            accessor.create(dataObject, keyGenFunc, th.asyncExpect(function (err, retDataObject) {
                expect(err).to.be(null);
                expect(retDataObject.key).to.be(key);
                expect(retDataObject.expireAt).to.be(expireAtDate);
            }, done));
        });

        it("can update one short url expire time", function (done) {
            var expireAtDate = new Date(Date.now());
            var key = "vmware";
            var keyGenFunc = newKeyGenFunc(key);
            var dataObject = { originalUrl: VMWARE, expireAt: expireAtDate };
            accessor.create(dataObject, keyGenFunc, th.asyncExpect(function (err, retDataObject) {
                expect(err).to.be(null);
                expect(retDataObject.key).to.be(key);
                expect(retDataObject.expireAt).to.be(expireAtDate);
            }, done));
        });
    });

    describe("#fetch", function () {

        it("can fetch the original url according to the short url", function (done) {
            var dataObject = { originalUrl: GOOGLE };
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
            var expireAtDate = new Date(Date.now() - 1000);
            var dataObject = { originalUrl: GOOGLE, expireAt: expireAtDate };
            var key = "google";
            var keyGenFunc = newKeyGenFunc(key);
            accessor.create(dataObject, keyGenFunc, th.asyncExpect(function (err, retDataObject) {
                expect(err).to.be(null);
                expect(retDataObject.key).to.be(key);
                accessor.fetch(key, th.asyncExpect(function (err, retDataObject) {
                    expect(err).to.be(null);
                    expect(retDataObject).to.not.be.ok();
                }, done));
            }, done, true));
        });
    });
});
