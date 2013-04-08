// Parse the Tempest cloud to get service binding information
var Services = new Class({
    initialize: function () {
        var services = [];
        try {
            var vcapServices = JSON.parse(process.env.VCAP_SERVICES);
            for (var key in vcapServices) {
                if (Array.isArray(vcapServices[key])) {
                    services = services.concat(vcapServices[key]);
                }
            }
        } catch (e) {
        }
        services.forEach(function (service) {
            if (/teenyurl-redis-cache/.exec(service.name)) {
                    Object.defineProperty(this, "redisCache", {
                        value: service.credentials,
                        writable: false
                    });
            } else if (/teenyurl-mongodb/.exec(service.name)) {
                    Object.defineProperty(this, "mongoDb", {
                        value: service.credentials,
                        writable: false
                    });
            } else if (/teenyurl-postgres/.exec(service.name)) {
                    Object.defineProperty(this, "postgres", {
                        value: service.credentials,
                        writable: false
                    });
            }
        }, this);
    }
});

module.exports = new Services();
