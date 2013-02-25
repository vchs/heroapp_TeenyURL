var mongoose = require('mongoose');

var tinyURLSchema = new mongoose.Schema( {
    key: { type: String, index: { unique: true, required: true }},
    originalUrl: { type: String, index: { unique: true, required: true }},
    createdAt: Date,
    expireAt: Date
    },
    { id: false,  shardkey: { key: 1 } }
);

tinyURLSchema.methods.importFrom = function (dataObject) {
    this.originalUrl = dataObject.originalUrl;
    this.expireAt = dataObject.expireAt;
};

tinyURLSchema.methods.export = function () {
   var dataObject = this.toObject();
   delete dataObject._id;
   return dataObject;
};

module.exports = mongoose.model('TinyUrl', tinyURLSchema, 'tinyurl');
