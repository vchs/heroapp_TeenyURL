// Test Helpers

/** Conditional describe
 *
 * Use:
 *    when(condition).describe("...", function () { ... });
 * When the condition is true, the normal describe will be used,
 * otherwise describe.skip will be used.
 */
exports.when = function (condition) {
    return condition ? {
        describe: function (description, tests) { describe(description, tests); }
    } : {
        describe: function (description, tests) {
            console.log("Skipped: " + description);
            describe.skip(description, tests);
        }
    };
};

/** Handle exception raised in async callback functions.
 * 
 * Exceptions raised in async callbacks can't be caught by Mocha framework
 * automatically, and this result in meaningless error report.
 * So for any async callbacks which will perform some assertions,
 * use asyncExpect to wrap it over.
 *
 * @param action the real callback function
 * @param done the done function passed from Mocha framework
 * @param more (optional) true if there are more async callbacks, so done will not be invoked
 */
exports.asyncExpect = function (action, done, more) {
    if (!done) {
        return action;
    }
    
    return function () {
        var err = undefined, result;
        try {
            result = action.apply(this, arguments);
        } catch (e) {
            err = e;
        }
        if (err) {
            done(err);
        } else if (!more) {
            done();
        }
        return result;
    };
};

/** The utility class for defining mocked methods */
exports.MockedClass = new Class({
    mock: function (method, mockedFn, sync) {
        var self = this;            
        if (typeof(mockedFn) == "function") {
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
