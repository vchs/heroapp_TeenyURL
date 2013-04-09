var expect  = require("expect.js"),
    sandbox = require("sandboxed-module"),
    th = require("./helpers");

describe("SqlDataAccessor", function () {
    
    function createDataAccessor(mockedShortUrl) {
        var SqlDataAccessor = sandbox.require("../app/lib/SqlDataAccessor", {
            requires: {
                "sequelize-postgres": {
                    sequelize: new Class({
                        initialize: function () {
                            
                        },
                        
                        define: function (name, schema, options) {
                            if (options.instanceMethods) {
                                mockedShortUrl.instanceMethods = options.instanceMethods;
                            }
                            return mockedShortUrl;
                        }
                    })
                }
            }
        });
        return new SqlDataAccessor("dummy", {});
    }
    
    function forSuccess(fn) {
        return {
            error: function (callback) { return this; },
            success: function (callback) {
                process.nextTick(function () {
                    fn(callback);
                });
                return this;
            }
        };
    }
    
    function makeKeyGenFn(key) {
        return  function (dataObject, callback) {
            callback(null, key);
        };
    }

    MockedShortUrl = new Class({
        Implements: [th.MockedClass],
        
        initialize: function () {
            this.instanceMethods = {};
        }
    });
    
    var dataAccessor, mockedShortUrl;
    
    beforeEach(function () {
        mockedShortUrl = new MockedShortUrl();
        dataAccessor = createDataAccessor(mockedShortUrl);
    });
    
    it("#create a new mapping", function (done) {
        var dataObject = {
            originalUrl: "DUMMY_ORIGINAL_URL",
            expireAt: new Date()
        };
        
        mockedShortUrl.mock("find", function (query) {
            expect(query.where).to.eql({ originalUrl: dataObject.originalUrl });
            return forSuccess(function (callback) {
                    callback(null); // not found
                });
        }, true);
        mockedShortUrl.mock("findOrCreate", th.asyncExpect(function (query, value) {
            expect(query.originalUrl).to.eql(dataObject.originalUrl);
            expect(value.key).to.be.ok();
            expect(value.expireAt).to.eql(dataObject.expireAt);
            var shortUrl = {
                key: value.key,
                originalUrl: query.originalUrl,
                expireAt: value.expireAt,
                updateWhenChanged: function () {
                    return mockedShortUrl.instanceMethods.updateWhenChanged.apply(this, arguments);
                }
            };
            
            return forSuccess(function (callback) {
                callback(shortUrl);
            });
        }, done, true), true);
        
        dataAccessor.create(dataObject, makeKeyGenFn("dummy"), th.asyncExpect(function (err, savedObject) {
            expect(err).not.be.ok();
            expect(savedObject).to.be.ok();
            expect(savedObject.key).to.eql("dummy");
        }, done));
    });
    
    it("#create with an existing url", function (done) {
        var existedUrl = {
            key: "ExistedKey",
            originalUrl: "ExistedUrl",
            expireAt: null,
            updateWhenChanged: function () {
                return mockedShortUrl.instanceMethods.updateWhenChanged.apply(this, arguments);
            }
        };
        
        var expireAt = new Date();
        var dataObject = {
            originalUrl: existedUrl.originalUrl,
            expireAt: expireAt
        };
        
        mockedShortUrl.mock("find", function (query) {
            expect(query.where.originalUrl).to.eql(existedUrl.originalUrl);
            return forSuccess(function (callback) { callback(existedUrl); });
        }, true);
        
        existedUrl.updateAttributes = th.asyncExpect(function (attributes) {
            expect(attributes.expireAt).to.eql(expireAt);
            this.expireAt = attributes.expireAt;
            return forSuccess(function (callback) { callback(); });
        }, done, true);
        
        dataAccessor.create(dataObject, makeKeyGenFn(existedUrl.key), th.asyncExpect(function (err, savedObject) {
            expect(err).not.be.ok();
            expect(savedObject.key).to.eql(existedUrl.key);
            expect(savedObject.expireAt).to.eql(expireAt);
            expect(existedUrl.expireAt).to.eql(expireAt);
        }, done));
    });
    
    it("#fetch a valid mapping", function (done) {
        var shortUrl = {
            key: "DummyKey",
            originalUrl: "DummyUrl",
            expireAt: null
        };
        shortUrl.values = shortUrl;
        mockedShortUrl.mock("find", function () {
            return forSuccess(function (callback) { callback(shortUrl); });
        }, true);
        
        dataAccessor.fetch(shortUrl.key, th.asyncExpect(function (err, dataObject) {
            expect(err).not.be.ok();
            expect(dataObject).to.be.ok();
        }, done));
    });
    
    it("#fetch a expired mapping", function (done) {
        var shortUrl = {
            key: "DummyKey",
            originalUrl: "DummyUrl",
            expireAt: new Date() - 1000
        };
        shortUrl.values = shortUrl;
        mockedShortUrl.mock("find", function () {
            return forSuccess(function (callback) { callback(shortUrl); });
        }, true);
        
        dataAccessor.fetch(shortUrl.key, th.asyncExpect(function (err, dataObject) {
            expect(err).not.be.ok();
            expect(dataObject).not.be.ok();
        }, done));
    });
});