var expect  = require("expect.js"),
    sandbox = require("sandboxed-module"),
    th = require("./helpers");

describe("RedisCacheProvider", function () {
    
    function createProvider(mockedClient) {
        var RedisCacheProvider = sandbox.require("../app/lib/RedisCacheProvider", {
            requires: {
                "redis": {
                    createClient: function () { return mockedClient; }
                },
                "./ServiceBinding": {
                    redisCache: {}
                }
            }
        });
        return new RedisCacheProvider();
    }

    var MockedRedisClient = new Class({
        Implements: [process.EventEmitter, th.MockedClass]
    });

    var MockedMultiObject = new Class({
        initialize: function () {
            this.ops = [];
        },
        
        set: function (key, value) {
            this.ops.push({ op: "set", key: key, value: value });
            return this;
        },
        
        expireat: function (key, expiration) {
            this.ops.push({ op: "expireat", key: key, expiration: expiration });
            return this;
        },
        
        exec: function (callback) {
            var ops = this.ops;
            process.nextTick(function () {
                callback(null, ops);
            });
        }
    });
    
    var client, provider;
    
    beforeEach(function () {
        client = new MockedRedisClient();
        provider = createProvider(client);
    });
    
    it("#getValue", function (done) {
        client.mock("get", function (key, callback) {
            callback(null, key);
        });
        var ret = provider.getValue("key", th.asyncExpect(function (err, result) {
            expect(err).to.be(null);
            expect(result).to.eql("key");
        }, done));
        expect(ret).to.be(provider);
    });
    
    it("#setValue without expiration", function (done) {
        client.mock("set", function (key, value, callback) {
            callback(null, key, value);
        });
        var ret = provider.setValue("key", "value", null, th.asyncExpect(function (err, key, value) {
            expect(err).to.be(null);
            expect(key).to.eql("key");
            expect(value).to.eql("value");
        }, done));
        expect(ret).to.be(provider);
    });
    
    it("#setValue with only expiration", function (done) {
        client.mock("expireat", function (key, expiration, callback) {
            callback(null, key, expiration);
        });
        var expireAt = new Date(Date.now() + 10000);
        var ret = provider.setValue("key", null, expireAt, th.asyncExpect(function (err, key, expiration) {
            expect(err).to.be(null);
            expect(key).to.eql("key");
            expect(expiration).to.eql(Math.floor(expireAt.valueOf() / 1000));
        }, done));
        expect(ret).to.be(provider);
    });
    
    it("#setValue without value and expiration", function (done) {
        client.mock("persist", function (key, callback) {
            callback(null, key);
        });
        var ret = provider.setValue("key", null, null, th.asyncExpect(function (err, key) {
            expect(err).to.be(null);
            expect(key).to.eql("key");
        }, done));
        expect(ret).to.be(provider);
    });
    
    it("#setValue with value and expiration", function (done) {
        client.mock("multi", new MockedMultiObject());
        var expireAt = new Date(Date.now() + 10000);
        var ret = provider.setValue("key", "value", expireAt, th.asyncExpect(function (err, ops) {
            expect(err).to.be(null);
            expect(ops).to.eql([
                { op: "set", key: "key", value: "value" },
                { op: "expireat", key: "key", expiration: Math.floor(expireAt.valueOf() / 1000) }
            ]);
        }, done));
        expect(ret).to.be(provider);
    });
});