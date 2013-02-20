var should = require('should');
var expect = require('expect.js');

describe("Skeleton", function () {
    it("should works", function () {
        [].should.be.have.lengthOf(0);
    });
    
    it("expect works", function () {
        expect([]).to.be.a(Array);
    });
});