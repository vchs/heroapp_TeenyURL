var sandbox = require('sandboxed-module');
var expect  = require('expect.js');

describe("ServiceBinding", function () {
    var REDIS_HOST = "REDIS_HOST", REDIS_PORT = 6379;
    var MONGODB_URL = "MONGODB_URL";
    var VMC_SERVICES = JSON.stringify([
        { name: "something", options: {} },
        { name: "tinyurl-redis-cache", options: { host: REDIS_HOST, port: REDIS_PORT } },
        { name: "tinyurl-mongodb", options: { url: MONGODB_URL } }
    ]);
    
    var services;
    
    before(function () {
        services = sandbox.require("../app/lib/ServiceBinding", {
            globals: {
                process: {
                    env: { 'VMC_SERVICES': VMC_SERVICES }
                }
            }
        });
    });

    it("#redisCache", function () {
        expect(services.redisCache).to.be.ok();
        expect(services.redisCache.host).to.eql(REDIS_HOST);
        expect(services.redisCache.port).to.eql(REDIS_PORT);
    });
    
    it("#mongoDb", function () {
        expect(services.mongoDb).to.be.ok();
        expect(services.mongoDb.url).to.eql(MONGODB_URL);
    });
});