var mongoose = require('mongoose');
var services = require('./ServiceBinding');
var async = require('async');
var TinyUrl = require('./models/TinyUrl');

mongoose.connect(services.mongoDb.url);

module.exports = new Class({

    // implements IDataAccessor
    create: function (dataObject, keyGen, callback) {
      var succeed = false;
      var rounds = 0;
      var MAX_ROUNDS = 200;
      var tinyUrl = new TinyUrl;
      tinyUrl.importFrom(dataObject);
      async.whilst(
        function() { return succeed == false && rounds < MAX_ROUNDS },
        function(iterationDone) {
          rounds ++;
          TinyUrl.findOne({ originalUrl : dataObject.originalUrl}, null, null, function(findError, oldEntry) {
            if (findError || oldEntry == null) {
              keyGen(dataObject, function(err, value) {
                tinyUrl.key = value;
                tinyUrl.created_at = Date.now();
                tinyUrl.save(function(saveError, newUrl) {
                  if (saveError && saveError.code != 11000){
                    rounds = MAX_ROUNDS;
                    //raise error immediately
                    iterationDone(saveError);
                  } else {
                    if (saveError == null) {
                      dataObject.key = tinyUrl.key;
                      succeed = true;
                    }
                    iterationDone(null);
                  }
                });
              });
            }
            else {
              dataObject.key = oldEntry.key;
              succeed = true;
              iterationDone();
            }
          });
        },
        function(whilstErr) {
          if (succeed == false) {
            if (whilstErr) {
              callback(whilstErr);
            } else {
              callback(new Error('fail after ' + MAX_ROUNDS + ' times of trial.'));
            }
          } else {
            callback(null, dataObject);
          }
        });
      return this;
    },

    fetch: function (keyQuery, callback) {
        TinyUrl.findOne({ key : keyQuery }, function(err, tinyUrl){
            if (err != null){
                callback(err);
            }else{
                callback(err, tinyUrl.export());
            }
        });
        return this;
    }
});
