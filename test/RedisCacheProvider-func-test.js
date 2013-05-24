var expect = require("expect.js"),
    services = require("../lib/ServiceBinding"),
    th = require("./helpers");

th.when(services.redisCache)
  .describe("RedisCacheProvider.Functional", function () {
    var provider;
    
    var KEY = "RedisCacheProvider-test-key";
    var VAL = "RedisCacheProvider-test-val";
    
    before(function () {
        var RedisCacheProvider = require("../lib/RedisCacheProvider");
        provider = new RedisCacheProvider(services.redisCache);
    });
    
    beforeEach(function (done) {
        provider.setValue(KEY, VAL, null, th.asyncExpect(function (err) {
            expect(err).to.be(null);
        }, done));
    });
    
    it("#getValue", function (done) {
        provider.getValue(KEY, th.asyncExpect(function (err, value) {
            expect(err).to.be(null);
            expect(value).to.eql(VAL);
        }, done));
    });
    
    it("#setValue with only expireAt", function (done) {
        var expireAt = new Date(Date.now() + 1000);
        provider.setValue(KEY, null, expireAt, th.asyncExpect(function (err) {
            expect(err).to.be(null);
            provider.getValue(KEY, th.asyncExpect(function (err, value) {
                expect(err).to.be(null);
                expect(value).to.eql(VAL);
                setTimeout(function () {
                    provider.getValue(KEY, th.asyncExpect(function (err, value) {
                        expect(err).to.be(null);
                        expect(value).to.be(null);
                    }, done));
                }, 1500);
            }, done, true));
        }, done, true));
    });
    
    it("#setValue removes expiration", function (done) {
        var expireAt = new Date(Date.now() + 1000);
        provider.setValue(KEY, null, expireAt, th.asyncExpect(function (err) {
            expect(err).to.be(null);
            provider.setValue(KEY, null, null, th.asyncExpect(function (err) {
                expect(err).to.be(null);
                setTimeout(function () {
                    provider.getValue(KEY, th.asyncExpect(function (err, value) {
                        expect(err).to.be(null);
                        expect(value).to.be(VAL);
                    }, done));
                }, 1500);
            }, done, true));
        }, done, true));
    });
});