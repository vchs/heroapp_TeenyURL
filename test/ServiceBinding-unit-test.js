var expect = require("expect.js"),
    sandbox = require('sandboxed-module');


describe("ServiceBinding", function () {
    var REDIS_HOST = "REDIS_HOST", REDIS_PORT = 6379, REDIS_PASSWORD = "password";
    var POSTGRES_PORT = 5432;
    var VCAP_SERVICES = JSON.stringify({
        "postgres-9.1": [
            { name: "something", credentials: {} },
            { name: "teenyurl-postgres-test", credentials: { database: "teenyurl", port: POSTGRES_PORT } }
        ],
        "redis-2.6": [
            { name: "redis-2.6", credentials: {} }
        ],
        "redis-2.4": [
            { name: "redis-2.4", credentials: {} },
            { name: "teenyurl-redis-cache-test", credentials: { host: REDIS_HOST, port: REDIS_PORT, password: REDIS_PASSWORD } }
        ]
    });
    
    var services;
    
    before(function () {
        services = sandbox.require("../lib/ServiceBinding", {
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
    
    it("#postgres", function () {
        expect(services.postgres).to.be.ok();
        expect(services.postgres.port).to.eql(POSTGRES_PORT);
    });
});
