var expect = require('expect.js');

describe("Skeleton", function () {
    it("expect works", function () {
        expect([]).to.be.an(Array);
    });
    
    it("mootools loaded", function () {
        expect(Class).to.be.a(Function);
        var MyClass = new Class({
            initialize: function (val) {
                this.value = val;
            }
        });
        var obj = new MyClass(30);
        expect(obj.value).to.eql(30);
    });
});
