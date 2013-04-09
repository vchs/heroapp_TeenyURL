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
        var name2Property = { 
            "redis-cache" : "redisCache",
            "mongodb" : "mongoDb"
        };
        services.forEach(function (service) {
            result = /teenyurl-(redis-cache|postgres|mysql|mongodb)/.exec(service.name);
            if (!result) 
                return;
            var propertyName = name2Property[result[1]] ? name2Property[result[1]] : result[1];
            Object.defineProperty(this, propertyName, {
                value: service.credentials,
                writable: false
            });
        }, this);
    }
});

module.exports = new Services();
