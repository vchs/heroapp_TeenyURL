var expect  = require("expect.js"),
    sandbox = require("sandboxed-module"),
    th = require("./helpers");

describe("MongoDbDataAccessor", function () {
   
    function createDataAccessor (mockedTinyUrl) {
        var MongoDbDataAccessor = sandbox.require("../app/lib/MongoDbDataAccessor", {
            requires: {
                "./models/TinyUrl": {
                    findOne: function () {
                        return mockedTinyUrl.findOne.apply(mockedTinyUrl, arguments);
                    },
                    create: function () {
                        return mockedTinyUrl.create.apply(mockedTinyUrl, arguments);
                    }
                },
                "mongoose": {
                    connect: function () { }
                }
            }
        });
        return new MongoDbDataAccessor();
    }
    
    MockedTinyUrl = new Class({
        Implements: [th.MockedClass]
    });

    function makeKeyGenFn(key) {
        if (Array.isArray(key)) {
            var keys = {
                index: 0,
                keys: key
            };
            return function (dataObject, callback) {
                callback(null, keys.keys[keys.index ++]);
            };
        }
        return  function (dataObject, callback) {
            callback(null, key);
        };
    }

    var tinyUrl;
    var accessor;

    beforeEach(function () {
        tinyUrl = new MockedTinyUrl();
        accessor = createDataAccessor(tinyUrl);
    });
    
    var DUP_KEY_ERROR = 11000;
    
    var TEST_KEY1 = "testk1";
    var TEST_KEY2 = "testk2";
    var TEST_URL1 = "http://sample1.url.test.domain";
    
    it("#create a new mapping", function (done) {
        var createdDataObject;
        
        tinyUrl.mock("findOne", function (query, callback) {
            callback(null, null);
        });
        tinyUrl.mock("create", function (dataObject, callback) {
            createdDataObject = dataObject;
            callback(null, dataObject);
        });
        
        var expireAt = new Date();
        var sample = { originalUrl: TEST_URL1, expireAt: expireAt };
        accessor.create(sample, makeKeyGenFn(TEST_KEY1), th.asyncExpect(function (err, dataObject) {
            expect(err).to.be(null);
            expect(createdDataObject).to.eql(dataObject);
            expect(dataObject.key).to.eql(TEST_KEY1);
            expect(dataObject.originalUrl).to.eql(TEST_URL1);
            expect(dataObject.expireAt).to.eql(expireAt);
        }, done));
    });
    
    it("#create a existing mapping", function (done) {
        tinyUrl.mock("findOne", function (query, callback) {
            var m = Object.create({
                save: function (callback) {
                    callback(null);
                }
            });
            m.key = TEST_KEY2;
            m.originalUrl = TEST_URL1;
            callback(null, m);
        });
        
        var expireAt = new Date();
        var sample = { originalUrl: TEST_URL1, expireAt: expireAt };
        accessor.create(sample, makeKeyGenFn(TEST_KEY1), th.asyncExpect(function (err, dataObject) {
            expect(err).to.be(null);
            expect(dataObject.key).to.eql(TEST_KEY2);
            expect(dataObject.originalUrl).to.eql(TEST_URL1);
            expect(dataObject.expireAt).to.eql(expireAt);
        }, done));
    });
    
    it("#create retry on dup key", function (done) {
        var created = [];
        
        tinyUrl.mock("findOne", function (query, callback) {
            callback(null, null);
        });
        tinyUrl.mock("create", function (dataObject, callback) {
            created.push(dataObject);
            if (dataObject.key == TEST_KEY1) {
                callback({ code: DUP_KEY_ERROR });
            } else {
                callback(null, dataObject);
            }
        });
        
        var sample = { originalUrl: TEST_URL1 };
        accessor.create(sample, makeKeyGenFn([TEST_KEY1, TEST_KEY2]), th.asyncExpect(function (err, dataObject) {
            expect(err).to.be(null);
            expect(dataObject.key).to.eql(TEST_KEY2);
            expect(dataObject.originalUrl).to.eql(TEST_URL1);
            expect(created).to.have.length(2);
            expect(created[0].key).to.eql(TEST_KEY1);
            expect(created[1].key).to.eql(TEST_KEY2);
        }, done));
    });
});
