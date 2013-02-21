var should = require('should');
var CacheDataAccessor = require('../app/lib/CacheDataAccessor.js').CacheDataAccessor;

var cacheDataAccessor;

var MockDataAccessor = new Class({
    initialize: function(){
        this.data = {};
    },

    create: function(dataObject, keyGen, callback){
        this.data[keyGen] = dataObject.originalurl;
        dataObject.key = keyGen;
        callback(null, dataObject);
    },

    fetch: function(key, callback){
        var url = this.data[key];
        var newDataObject = {};
        newDataObject.key = key;
        newDataObject.originalurl = url;
        callback(null, newDataObject);
    }

});

var MockCacheProvider = new Class({
    initialize: function(){
        this.cache = {};
    },

    getValue: function(key, callback){
        callback(null, this.cache[key]);
    },

    setValue: function(key, value, expireAt, callback){
        this.cache[key] = value;
    }
});

var mockDA = new MockDataAccessor();
var mockCP = new MockCacheProvider();
cacheDataAccessor = new CacheDataAccessor(mockCP, mockDA);

describe("CacheDataAccessor", function () {
    it("can create one new CacheDataAccessor object", function(){
        var mockDataAccessor = 1;
        var mockCacheProvider = 2;
        var cacheDataAccessor = new CacheDataAccessor(mockCacheProvider, mockDataAccessor);
        cacheDataAccessor._cacheProvider.should.equal(2);
        cacheDataAccessor._dataAccessor.should.equal(1);
    });

    it("can create new tiny url", function(){
        var newDataObject = {};
        newDataObject.originalurl = "www.vmware.com";
        var idkey = "generated_key";
        cacheDataAccessor.create(newDataObject, idkey, function(err, dataObject){
            dataObject.key.should.equal(idkey);
        });
    });

    it("can fetch the original url according to the tiny one", function(){
        cacheDataAccessor.fetch("generated_key", function(err, dataObject){
            dataObject.originalurl.should.equal("www.vmware.com");
        });
    });

});