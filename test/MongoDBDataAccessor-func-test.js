var expect  = require('expect.js');
var idgen = require('idgen')
var th = require('./helpers');

th.when(process.env.MONGODB_CONN)
  .describe("MongoDBDataAccessor.Functional", function () {
    var mongodb_accessor;
    var dataObject;
    
    var ORIGINALURL = "http://docs.cloudfoundry.com/services/mongodb/nodejs-mongodb.html"
    
    before(function () {
        var MongoDBDataAccessor = require('../app/lib/MongoDBDataAccessor').MongoDBDataAccessor;
        mongodb_accessor = new MongoDBDataAccessor();
    });
    
    it("#create and fetch tinyURL", function (done) {
        var dateObject =  {originalUrl : ORIGINALURL}
        var expireAt = new Date(Date.now() + 1000);
        mongodb_accessor.create(dateObject, idgen, th.asyncExpect(function (err, createResult) {
            expect(err).to.be(null);
            expect(createResult.originalUrl).to.eql(ORIGINALURL);
            expect(createResult).to.have.property('key');
            expect(createResult.key).to.not.be.empty();
            mongodb_accessor.fetch(createResult.key, th.asyncExpect(function (err, fetchResult) {
                expect(err).to.be(null);
                expect(fetchResult).to.have.property('originalUrl');
                expect(fetchResult.originalUrl).to.eql(ORIGINALURL);
                var dateObjectTheSame =  {originalUrl : ORIGINALURL}
                mongodb_accessor.create(dataObject, idgen, th.asyncExpect(function (err, createResult2) {
                  expect(err).to.be(null);
                  expect(createResult2.key).to.not.be.empty();
                  expect(createResult2.key).to.eql(createResult.key);
                }, done, true));
            }, done, true));
        }, done, true));
    });
});
