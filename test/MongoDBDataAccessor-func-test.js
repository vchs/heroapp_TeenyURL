var expect  = require('expect.js');
var services = require('../app/lib/ServiceBinding');
var idgen = require('idgen');
var services = require('../app/lib/ServiceBinding');
var th = require('./helpers');

var keyGen = function generate_key(dataObject, callback){
  callback(null, idgen());
};

th.when(services.mongoDb)
.describe("MongoDBDataAccessor.Functional", function () {
    var ORIGINALURL = "http://docs.cloudfoundry.com/services/mongodb/nodejs-mongodb.html" + idgen(); 
    var mongodbAccessor;

    before(function () {
        var MongoDBDataAccessor = require('../app/lib/MongoDBDataAccessor');
        mongodbAccessor = new MongoDBDataAccessor();
    });

    it("#create and fetch tinyURL", function (done) {
      var dataObject;
      var expireAtDate = new Date(Date.now() + 1000);
      var dataObject =  { originalUrl : ORIGINALURL, expireAt : expireAtDate};
      mongodbAccessor.create(dataObject, keyGen, th.asyncExpect(function (err, createResult) {
        expect(err).to.be(null);
        expect(createResult.originalUrl).to.eql(ORIGINALURL);
        expect(createResult).to.have.property('key');
        expect(createResult.key).to.not.be.empty();
        expect(createResult).to.have.property('expireAt');
        expect(createResult.expireAt).to.eql(expireAtDate);
        mongodbAccessor.fetch(createResult.key, th.asyncExpect(function (err, fetchResult) {
          expect(err).to.be(null);
          expect(fetchResult).to.have.property('originalUrl');
          expect(fetchResult.originalUrl).to.eql(ORIGINALURL);
          expect(fetchResult.expireAt).to.eql(expireAtDate);
          var dataObjectTheSame =  {originalUrl : ORIGINALURL};
          mongodbAccessor.create(dataObject, keyGen, th.asyncExpect(function (err, createResult2) {
            expect(err).to.be(null);
            expect(createResult2.key).to.not.be.empty();
            expect(createResult2.key).to.eql(createResult.key);
            expect(createResult2.expireAt).to.eql(expireAtDate);
            }, done));
          }, done, true));
        }, done, true));
    });
});
