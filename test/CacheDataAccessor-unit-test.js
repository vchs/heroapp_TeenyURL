var expect = require('expect.js');
var th = require('./helpers');
var CacheDataAccessor = require('../app/lib/CacheDataAccessor.js');

var ID_KEY = "generated_key";
var LONG_URL = "www.vmware.com";

var MockDataAccessor = new Class({
    initialize: function(){
        this.data = {};
    },

    create: function(dataObject, keyGen, callback){
        this.data[keyGen] = dataObject.originalurl;
        dataObject.key = keyGen;
        process.nextTick(function(){
            callback(null, dataObject);
        });
    },

    fetch: function(key, callback){
        var url = this.data[key];
        var newDataObject = {};
        newDataObject.key = key;
        newDataObject.originalurl = url;
        process.nextTick(function(){
           callback(null, newDataObject);
        });
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

var mockDA, mockCP, cacheDataAccessor;

describe("CacheDataAccessor", function () {

    beforeEach(function(){
        mockDA = new MockDataAccessor();
        mockCP = new MockCacheProvider();
        cacheDataAccessor = new CacheDataAccessor(mockCP, mockDA);
    });

    describe("#create", function(){
        it("can create new tiny url", function(done){
            var newDataObject = {};
            newDataObject.originalurl = LONG_URL;
            var idkey = ID_KEY;
            var ret = cacheDataAccessor.create(newDataObject, idkey, th.asyncExpect(function(err, dataObject){
                expect(err).to.be(null);
                expect(dataObject.key).to.eql(idkey);
            }, done));
            expect(ret).to.be(cacheDataAccessor);
        });
    });

    describe("#fetch", function(){
        it("can fetch the original url when cache has the item", function(done){
            mockCP.cache[ID_KEY] = LONG_URL;
            var ret = cacheDataAccessor.fetch(ID_KEY, th.asyncExpect(function(err, dataObject){
                expect(err).to.be(null);
                expect(dataObject.originalurl).to.eql(LONG_URL);
            }, done));
            expect(ret).to.be(cacheDataAccessor);
        });

        it("can fetch the original url when cache has not but db has it", function(done){
            mockDA.data[ID_KEY] = LONG_URL;
            var ret = cacheDataAccessor.fetch(ID_KEY, th.asyncExpect(function(err, dataObject){
                expect(err).to.be(null);
                expect(dataObject.originalurl).to.eql(LONG_URL);
            }, done));
            expect(ret).to.be(cacheDataAccessor);
        });
    });
});
