var mongoose = require('mongoose');

tinyURLSchema = new mongoose.Schema( {
  key: { type : String, index : { unique: true }},
  originalUrl: { type : String, index : true },
  created_at : Date,
  expired_at: Date
},
{ id: false,  shardkey : {key: 1} }
);

tinyURLSchema.methods.importFrom = function (dataObject) {
  this.originalUrl = dataObject.originalUrl;
  this.expired_at = dataObject.expired_at;
};

tinyURLSchema.methods.export = function() {
  dataObject = this.toObject();
  delete dataObject._id;
  delete dataObject.created_at;
  return dataObject;
}


exports.TinyUrl = mongoose.model('TinyUrl', tinyURLSchema, "tinyUrl");
