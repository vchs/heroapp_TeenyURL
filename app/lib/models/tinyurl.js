var TinyUrl = function() {
  var mongoose = require('mongoose');

  var tinyURLSchema = new mongoose.Schema( {
    key: { type : String, index : { unique: true, required : true }},
    originalUrl: { type : String, required : true, index : true },
    createdAt: Date,
    expiredAt: Date
    },
    { id: false,  shardkey : {key: 1} }
  );

  tinyURLSchema.methods.importFrom = function (dataObject) {
    this.originalUrl = dataObject.originalUrl;
    this.expired_at = dataObject.expired_at;
  };

  tinyURLSchema.methods.export = function() {
   var dataObject = this.toObject();
   delete dataObject._id;
   delete dataObject.created_at;
   return dataObject;
  };

  var _model =  mongoose.model('tinyUrl', tinyURLSchema);

  return {
    model: _model
  };
}();

module.exports = TinyUrl;
