var TinyUrl = require('./model/tinyurl')
var async = require('async')

exports.MongoDBDataAccessor = new Class({

    initialize: function (){
    },

    // implements IDataAccessor
    create: function (dataObject, keyGen, callback) {
      var succeed = false
      var rounds = 0
      var MAX_ROUNDS = 200
      var tinyUrl = new TinyUrl()
      tinyUrl.importFrom(dataObject)
      async.whilst(
        function() { return succeed == false && rounds < MAX_ROUNDS },
        function(iterationDone) {
          rounds ++
          TinyUrl.find({ originalUrl : dataObject.originalUrl}, function(findError, oldEntry) {
            if (findError) {
              tinyUrl.key = keyGen()
              tinyUrl.created_at = Date.now()
              tinyUrl.save(function(saveError, newUrl) {
                if (saveError == null) {
                  dataObject.key = tinyUrl.key
                  succeed = true
                }
                iterationDone()
              })
            }
            else {
              dataObject.key = oldEntry.key
              succeed = true
              iterationDone()
            }
          })
        },
        function(whilstErr) {
          if (succeed == false) {
            if (whilstErr) {
              callback(whilstErr)
            } else {
              callback(new Error('fail after ' + MAX_ROUNDS + ' times of trial.'))
            }
          } else {
            callback(null, dataObject)
          }
        });
      return this;
    },

    fetch: function (keyQuery, callback) {
        TinyUrl.find({ key : keyQuery }, function(err, tinyUrl){
            if (err != null){
                callback(err)
            }else{
                callback(err, tinyUrl.export())
            }
        });
        return this;
    }
});
