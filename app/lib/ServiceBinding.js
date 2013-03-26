// Parse the Tempest cloud to get service binding information
var Services = new Class({
    initialize: function () {
        var services = null;
        try {
            services = JSON.parse(process.env.VMC_SERVICES);
        } catch (e) {
        }
        if (Array.isArray(services)) {
            this.services = services;
            Object.defineProperty(this, "redisCache", {
                value: this.findOptions("teenyurl-redis-cache"),
                writable: false
            });
            Object.defineProperty(this, "mongoDb", {
                value: this.findOptions("teenyurl-mongodb"),
                writable: false
            });
        }
    },
    
    find: function (serviceName) {
        var found = null;
        if (this.services) {
            this.services.some(function (service) {
                if (service.name === serviceName) {
                    found = service;
                    return true;
                }
                return false;
            });
        }
        return found;
    },
    
    findOptions: function (serviceName) {
        var service = this.find(serviceName);
        return service ? service.options : null;
    }
});

module.exports = new Services();