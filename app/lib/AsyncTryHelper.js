var async = require("async");

var MAX_TRIES = 200;

// Wraps async while loop for retrying jobFn
// until succeeded, error encountered, or MAX_TRIES reached
module.exports = function (jobFn, callback) {
    // create an internal state for jobFn to report
    // - success done(null, result)
    // - failure done(err)
    // - retry   retry()
    var state = Object.create({
        retry: function () {
            this.tries ++;
            this.iterationDone();
        },
        
        done: function (err, result) {
            this.completed = true;
            this.result = result;
            this.iterationDone(err);
        }
    });
    
    // initialize the state
    state.tries = 0;
    state.completed = false;
    
    // start the while loop
    async.whilst(
        function () { return !state.completed && state.tries < MAX_TRIES; },
        function (iterationDone) {
            state.iterationDone = iterationDone;
            try {
                jobFn(state);
            } catch (err) {
                state.done(err);
            }
        },
        function (err) {
            callback(err, state.result, state.tries >= MAX_TRIES);
        }
    );
}

