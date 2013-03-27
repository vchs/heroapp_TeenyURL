var expect = require("expect.js"),
    sandbox = require('sandboxed-module');


describe("ServiceBinding", function () {
    var REDIS_HOST = "REDIS_HOST", REDIS_PORT = 6379, REDIS_PASSWORD = "password";
    var MONGODB_URL = "MONGODB_URL";
    var VCAP_SERVICES = JSON.stringify({
        "mongodb-2.0": [
            { name: "something", credentials: {} },
            { name: "teenyurl-mongodb", credentials: { url: MONGODB_URL } }
        ],
        "redis-2.6": [
            { name: "redis-2.6", credentials: {} }
        ],
        "redis-2.4": [
            { name: "redis-2.4", credentials: {} },
            { name: "teenyurl-redis-cache", credentials: { host: REDIS_HOST, port: REDIS_PORT, password: REDIS_PASSWORD } }
        ]
    });
    
    var services;
    
    before(function () {
        services = sandbox.require("../app/lib/ServiceBinding", {
            globals: {
                process: {
                    env: { "VCAP_SERVICES": VCAP_SERVICES }
                }
            }
        });
    });

    it("#redisCache", function () {
        expect(services.redisCache).to.be.ok();
        expect(services.redisCache.host).to.eql(REDIS_HOST);
        expect(services.redisCache.port).to.eql(REDIS_PORT);
        expect(services.redisCache.password).to.eql(REDIS_PASSWORD);
    });
    
    it("#mongoDb", function () {
        expect(services.mongoDb).to.be.ok();
        expect(services.mongoDb.url).to.eql(MONGODB_URL);
    });
});