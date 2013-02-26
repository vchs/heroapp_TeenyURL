var mongoose = require('mongoose');
var services = require('./ServiceBinding');
var async = require('async');
var TinyUrl = require('./models/TinyUrl');

mongoose.connect(services.mongoDb.url);

var MAX_ROUNDS = 200;

function insertOrUpdateWithPrecheck(tinyUrl, dataObject, state, keyGen, iterationCallback) {
    TinyUrl.findOne({ originalUrl : dataObject.originalUrl }, function (findError, oldEntry) {
        if (findError || !oldEntry) {
            keyGen(dataObject, function (err, value) {
                tinyUrl.key = value;
                tinyUrl.createdAt = Date.now();
                tinyUrl.save(function (saveError) {
                    if (saveError && saveError.code != 11000) {
                        // if not duplicated_key, raise error immediately
                        state.rounds = MAX_ROUNDS;
                        iterationCallback(saveError);
                    } else {
                        if (saveError == null) {
                            dataObject.key = tinyUrl.key;
                            state.succeed = true;
                        }
                        iterationCallback();
                    }
                });
            });
        } else {
            dataObject.key = oldEntry.key;
            if (tinyUrl.expireAt != oldEntry.expireAt) {
                // update expireAt field
                oldEntry.expireAt = tinyUrl.expireAt;
                oldEntry.save(function (err) {
                    state.rounds = MAX_ROUNDS;
                    state.succeed = !err;
                    iterationCallback(err);
                });
            } else {
                state.succeed = true;
                iterationCallback();
            }
        }
    });
}

module.exports = new Class({

    // implements IDataAccessor
    create: function (dataObject, keyGen, callback) {
        var state = { rounds: 0, succeed: false };
        var tinyUrl = new TinyUrl();
        tinyUrl.importFrom(dataObject);
        async.whilst(
            function () { return !state.succeed && state.rounds < MAX_ROUNDS },
            function (iterationDone) {
            state.rounds ++;
            insertOrUpdateWithPrecheck(tinyUrl, dataObject, state, keyGen, iterationDone);
        },
        function (whilstErr) {
            if (state.succeed) {
                callback(null, dataObject);
            } else {
                if (whilstErr) {
                    callback(whilstErr);
                } else {
                    callback(new Error('fail after ' + MAX_ROUNDS + ' times of trial.'));
                }
            }
        });
        return this;
    },

    fetch: function (keyQuery, callback) {
        TinyUrl.findOne({ 'key': keyQuery,  $or: [{ expireAt: undefined }, { expireAt: { $gte: new Date() } }] }, function (err, tinyUrl) {
            if (err || tinyUrl == null) {
                callback(err);
            } else {
                callback(err, tinyUrl);
            }
        });
        return this;
    }
});
