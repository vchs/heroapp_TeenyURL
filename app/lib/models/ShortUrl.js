var mongoose = require("mongoose");

var shortUrlSchema = new mongoose.Schema( {
        // the key generated uniquely for the original URL: http://teenyurl/key
        key: { type: String, index: { unique: true, required: true } },
        // the original URL the key mapped to
        originalUrl: { type: String, index: { unique: true, required: true } },
        // when the mapping expires
        expireAt: Date
    },
    { id: false,  shardkey: { key: 1 } }    // "key" is used as "id"
);

// converting model to data object
shortUrlSchema.methods.toDataObject = function () {
    return {
        key: this.key,
        originalUrl: this.originalUrl,
        expireAt: this.expireAt
    };
};

module.exports = mongoose.model("ShortUrl", shortUrlSchema, "shorturl");
