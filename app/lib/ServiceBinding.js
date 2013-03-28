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
            switch (service.name) {
                case "teenyurl-redis-cache":
                    Object.defineProperty(this, "redisCache", {
                        value: service.credentials,
                        writable: false
                    });
                    break;
                case "teenyurl-mongodb":
                    Object.defineProperty(this, "mongoDb", {
                        value: service.credentials,
                        writable: false
                    });
                    break;
                case "teenyurl-postgres":
                    Object.defineProperty(this, "postgres", {
                        value: service.credentials,
                        writable: false
                    });
                    break;
            }
        }, this);
    }
});

module.exports = new Services();
