var expect  = require('expect.js');
var idgen = require('idgen');
var services = require('../app/lib/ServiceBinding');
var th = require('./helpers');

var keyGen = function generate_key(dataObject, callback){
  callback(null, idgen());
};

th.when(services.mongoDb)
.describe("MongoDBDataAccessor.Functional", function () {
    var ORIGINURL_PREFIX = "http://docs.cloudfoundry.com/";
    var mongodbAccessor;

    before(function () {
        var MongoDBDataAccessor = require('../app/lib/MongoDBDataAccessor');
        mongodbAccessor = new MongoDBDataAccessor();
    });

    it("#return 'undefine' with not-exist key", function (done) {
      mongodbAccessor.fetch('notExistKey', th.asyncExpect(function (err, fetchResult) {
          expect(fetchResult).to.be(undefined);
        }, done));
    });

    it("#create and fetch tinyURL", function (done) {
      // Use idgen to generate a random url.
      var originalUrl = ORIGINURL_PREFIX + idgen();
      var expireAtDate = new Date(Date.now() + 3600000);
      var dataObject =  { originalUrl : originalUrl, expireAt : expireAtDate };
      mongodbAccessor.create(dataObject, keyGen, th.asyncExpect(function (err, createResult) {
        expect(err).to.be(null);
        expect(createResult.originalUrl).to.eql(originalUrl);
        expect(createResult).to.have.property('key');
        expect(createResult.key).to.not.be.empty();
        expect(createResult).to.have.property('expireAt');
        expect(createResult.expireAt).to.eql(expireAtDate);
        mongodbAccessor.fetch(createResult.key, th.asyncExpect(function (err, fetchResult) {
          expect(err).to.be(null);
          expect(fetchResult).to.have.property('originalUrl');
          expect(fetchResult.originalUrl).to.eql(originalUrl);
          expect(fetchResult.expireAt).to.eql(expireAtDate);
          var dataObjectNotExpire =  { originalUrl : originalUrl };
          mongodbAccessor.create(dataObjectNotExpire, keyGen, th.asyncExpect(function (err, createResult2) {
            expect(err).to.be(null);
            expect(createResult2.key).to.not.be.empty();
            expect(createResult2.key).to.eql(createResult.key);
            expect(createResult2.expireAt).to.be(undefined);
            }, done));
          }, done, true));
        }, done, true));
    });

});
