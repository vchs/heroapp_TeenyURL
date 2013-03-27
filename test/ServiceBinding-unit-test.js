var expect = require("expect.js"),
    sandbox = require('sandboxed-module');


describe("ServiceBinding", function () {
    var REDIS_HOST = "REDIS_HOST", REDIS_PORT = 6379;
    //var MONGODB_URL = "MONGODB_URL";
    var POSTGRES_PORT = 5432;
    var VMC_SERVICES = JSON.stringify([
        { name: "something", options: {} },
        { name: "teenyurl-redis-cache", options: { host: REDIS_HOST, port: REDIS_PORT } },
        { name: "teenyurl-postgres", options: { database: 'teenyurl', port: POSTGRES_PORT } }
        //{ name: "teenyurl-mongodb", options: { url: MONGODB_URL } }
    ]);
    
    var services;
    
    before(function () {
        services = sandbox.require("../app/lib/ServiceBinding", {
            globals: {
                process: {
                    env: { "VMC_SERVICES": VMC_SERVICES }
                }
            }
        });
    });

    it("#redisCache", function () {
        expect(services.redisCache).to.be.ok();
        expect(services.redisCache.host).to.eql(REDIS_HOST);
        expect(services.redisCache.port).to.eql(REDIS_PORT);
    });
    
    it("#postgres", function () {
        expect(services.postgres).to.be.ok();
        expect(services.postgres.port).to.eql(POSTGRES_PORT);
    });
});
