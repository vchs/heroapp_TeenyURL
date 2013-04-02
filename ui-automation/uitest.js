var Browser = require("zombie");
var assert = require("assert");
var urlTaobao = "http://www.taobao.com";
var urlGoogle = "http://www.google.com";
var Github = "http://www.baidu.com";
var site = "http://teenyurl.cloudfoundry.com";
var expiredDate = "01/01/2012 00:00";
var browser = new Browser();
var strftime = require('strftime');
var sleep = require('sleep');

describe("Teeny URL UI automation - ", function() {
  it("add existing url with future expiration time", function(done) {
    var lastStep = false;
    var futureTime;
    var alternativeURL;

    browser = new Browser();
    browser
      .visit(site)
      .then(function() { //shorten google url
        browser.fill("originalUrl", urlGoogle);
        return browser.pressButton("#url_submit");
      })
      .then(function() {
        return browser.clickLink("#short_url");
      })
      .then(function() { //check google homepage is opened, then go back to previous page
        assert.equal(browser.history._stack[1].url.href, urlGoogle + "/");
        return browser.back();
      })
      .then(function() {
        browser.fill("originalUrl", urlGoogle);
        var now = new Date();
        if (now.getSeconds() > 50) { //if seconds of current time > 50, then wait till next minute
          sleep.sleep(10);
          now = new Date();
        }
        futureTime = strftime("%m/%d/%Y %H:%M", new Date(Number((now.getTime() / 1000 + 60) * 1000)));
        console.log("futureTime: " + futureTime);
        browser.fill("#expire_at", futureTime);
        return browser.pressButton("#url_submit");
      })
      .then(function() {
        alternativeURL = browser.query("#short_url").childNodes[0]._nodeValue;
        return browser.clickLink("#short_url");
      })
      .then(function() {
        assert.equal(browser.history._stack[1].url.href, urlGoogle + "/");
        lastStep = true;
        sleep.sleep(60 - (new Date()).getSeconds() + 1);
        return browser.visit(alternativeURL);
      })
      .then(function() {
        assert.equal(true, false);
      })
      .fail(function(error) {
        console.log("debug msg: " + error);
        assert.equal(lastStep, true);
        assert.equal(browser.statusCode, 404);
        assert.equal(error, "Error: Server returned status code 404");
      })
      .then(done, done);
  });


});
