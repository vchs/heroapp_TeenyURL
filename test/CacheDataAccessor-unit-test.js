var expect = require("expect.js"),
    CacheDataAccessor = require("../app/lib/CacheDataAccessor"),
    th = require("./helpers");

var ID_KEY = "generated_key";
var LONG_URL = "www.vmware.com";

var keyGenFunc = function (dataObject, callback) {
    callback(null, ID_KEY);
};

var MockDataAccessor = new Class({
    initialize: function () {
        this.data = {};
    },

    create: function (dataObject, keyGenFunc, callback) {
        var self = this;
        keyGenFunc(dataObject.originalUrl, function (err, key) {
            self.data[key] = dataObject.originalUrl;
            dataObject.key = key;
            process.nextTick(function () {
                callback(null, dataObject);
            });
        });
    },

    fetch: function (key, callback) {
        var url = this.data[key];
        var newDataObject = {};
        newDataObject.key = key;
        newDataObject.originalUrl = url;
        process.nextTick(function () {
           callback(null, newDataObject);
        });
    }
});

var MockCacheProvider = new Class({
    initialize: function () {
        this.cache = {};
    },

    getValue: function (key, callback) {
        callback(null, this.cache[key]);
    },

    setValue: function (key, value, expireAt, callback) {
        this.cache[key] = value;
    }
});

describe("CacheDataAccessor", function () {

    var mockDataAccessor, mockCacheProvider, cacheDataAccessor;

    beforeEach(function () {
        mockDataAccessor = new MockDataAccessor();
        mockCacheProvider = new MockCacheProvider();
        cacheDataAccessor = new CacheDataAccessor(mockCacheProvider, mockDataAccessor);
    });

    describe("#create", function () {
        it("can create new tiny url", function (done) {
            var newDataObject = {originalUrl: LONG_URL};
            var ret = cacheDataAccessor.create(newDataObject, keyGenFunc, th.asyncExpect(function (err, dataObject) {
                expect(err).to.be(null);
                expect(dataObject.key).to.eql(ID_KEY);
            }, done));
            expect(ret).to.be(cacheDataAccessor);
        });
    });

    describe("#fetch", function () {
        it("can fetch the original url when cache has the item", function (done) {
            mockCacheProvider.cache[ID_KEY] = LONG_URL;
            var ret = cacheDataAccessor.fetch(ID_KEY, th.asyncExpect(function (err, dataObject) {
                expect(err).to.be(null);
                expect(dataObject.originalUrl).to.eql(LONG_URL);
            }, done));
            expect(ret).to.be(cacheDataAccessor);
        });

        it("can fetch the original url when cache has not but db has it", function (done) {
            mockDataAccessor.data[ID_KEY] = LONG_URL;
            var ret = cacheDataAccessor.fetch(ID_KEY, th.asyncExpect(function (err, dataObject) {
                expect(err).to.be(null);
                expect(dataObject.originalUrl).to.eql(LONG_URL);
            }, done));
            expect(ret).to.be(cacheDataAccessor);
        });
    });
});
