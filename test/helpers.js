exports.asyncExpect = function (action, done) {
    if (!done) {
        return action;
    }
    
    return function () {
        var err = undefined;
        try {
            action.apply(this, arguments);
        } catch (e) {
            err = e;
        }
        err == undefined ? done() : done(err);
    }
};

exports.MockedClass = new Class({
    mock: function (method, mockedFn, sync) {
        var self = this;            
        if (Array.isArray(mockedFn)) {
            var reply = mockedFn;
            this[method] = sync ? function () {
                var callback = arguments[arguments.length - 1];
                callback.apply(self, reply);
            } : function () {
                var callback = arguments[arguments.length - 1];
                process.nextTick(function () {
                    callback.apply(self, reply);
                });
            };
        } else if (typeof(mockedFn) == 'function') {
            this[method] = sync ? mockedFn : function () {
                var args = arguments;
                process.nextTick(function () {
                    mockedFn.apply(self, args);
                });
            };
        } else {
            this[method] = function () { return mockedFn; };
        }
    }
});
