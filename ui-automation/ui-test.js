var Browser = require("zombie");
var assert = require("assert");
var strftime = require('strftime');
var sleep = require('sleep');
var urlGoogle = "http://www.google.com";
var site = "http://teenyurl.cloudfoundry.com";
var expiredDate = "01/01/2012 00:00";
var browser = new Browser();

describe("Teeny URL UI automation - ", function() {
  it("check wording on homepage", function(done) {
    browser.visit(site) //visit homepage and check related items
      .then(function() {
        assert.ok(browser.success);
        assert.equal(browser.text("title"), "Tempest TeenyUrl");
        assert.ok(browser.text(':contains("TeenyURL")'));
        assert.ok(browser.text(':contains("Hi, please input your original URL:")'));
        assert.ok(browser.text(':contains("The shortened URL will expire at")'));
        assert.ok(browser.text(':contains("Shorten")'));
        assert.ok(browser.query("#copy_button"));
        assert.equal(site + "/KEY", browser.text("#short_url"));
        assert.equal(site + "/", browser.query("#short_url")._attributes.href._nodeValue);
      })
      .then(done, done);
  });

  it("add new url without expiration time", function(done) {
    var lastStep = false;
    var alternativeURL;
    browser = new Browser();
    browser
      .visit(site)
      .then(function() { //shorten google url
        browser.fill("originalUrl", urlGoogle);
        return browser.pressButton("#url_submit");
      })
      .then(function() { //click google alternative url
        alternativeURL = browser.text("#short_url");
        assert.equal(alternativeURL, browser.query("#short_url")._attributes.href._nodeValue);
        console.log("alternative url: " + browser.query("#short_url").childNodes[0]._nodeValue);
        return browser.clickLink("#short_url");
      })
      .then(function() { //check if google homepage is opened, then go back to previous page
        console.log("redirected url: " + browser.history._stack[1].url.href);
        assert.equal(browser.history._stack[1].url.href, urlGoogle + "/");
        return browser.back();
      })
      .then(function() { //delete google alternative url
        browser.fill("originalUrl", urlGoogle);
        browser.fill("#expire_at", expiredDate);
        return browser.pressButton("#url_submit");
      })
      .then(function() {
        lastStep = true;
        assert.ok(browser.text(':contains("URL is expired successfully.")'));
        assert.equal(site + "/KEY", browser.text("#short_url"));
        assert.equal(site + "/", browser.query("#short_url")._attributes.href._nodeValue);
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

  it("add new url with future expiration time", function(done) {
    var lastStep = false;
    var futureTime;
    var alternativeURL;

    browser = new Browser();
    browser
      .visit(site)
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

  it("add new url with past expiration time", function(done) {
    browser
      .visit(site)
      .then(function() { //shorten google url with expired date
        browser.fill("originalUrl", urlGoogle);
        browser.fill("#expire_at", expiredDate);
        return browser.pressButton("#url_submit");
      })
      .then(function() {
        assert.ok(browser.text(':contains("URL is expired successfully.")'));
        assert.equal(site + "/KEY", browser.text("#short_url"));
        assert.equal(site + "/", browser.query("#short_url")._attributes.href._nodeValue);
      })
      .then(done, done);
  });

  it("add existing url without expiration time", function(done) {
    var lastStep = false;
    var alternativeURL;
    browser = new Browser();
    browser
      .visit(site)
      .then(function() { //shorten google url
        browser.fill("originalUrl", urlGoogle);
        return browser.pressButton("#url_submit");
      })
      .then(function() {
        alternativeURL = browser.text("#short_url");
        assert.equal(alternativeURL, browser.query("#short_url")._attributes.href._nodeValue);
        console.log("alternative url: " + alternativeURL);
        return browser.clickLink("#short_url");
      })
      .then(function() { //check google homepage is opened, then go back to previous page
        assert.equal(browser.history._stack[1].url.href, urlGoogle + "/");
        return browser.back();
      })
      .then(function() { //shorten existing google url
        browser.fill("originalUrl", urlGoogle);
        return browser.pressButton("#url_submit");
      })
      .then(function() { //click google alternative url
        console.log("alternative url: " + browser.query("#short_url").childNodes[0]._nodeValue);
        return browser.clickLink("#short_url");
      })
      .then(function() {
        assert.equal(browser.history._stack[1].url.href, urlGoogle + "/");
        return browser.back();
      })
      .then(function() { //delete google alternative url
        browser.fill("originalUrl", urlGoogle);
        browser.fill("#expire_at", expiredDate);
        return browser.pressButton("#url_submit");
      })
      .then(function() {
        lastStep = true;
        assert.ok(browser.text(':contains("URL is expired successfully.")'));
        assert.equal(site + "/KEY", browser.text("#short_url"));
        assert.equal(site + "/", browser.query("#short_url")._attributes.href._nodeValue);
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

  it("add existing url with past expiration time", function(done) {
    var lastStep = false;
    var alternativeURL;
    browser = new Browser();
    browser
      .visit(site)
      .then(function() { //shorten google url
        browser.fill("originalUrl", urlGoogle);
        return browser.pressButton("#url_submit");
      })
      .then(function() {
        alternativeURL = browser.text("#short_url");
        return browser.clickLink("#short_url");
      })
      .then(function() { //check google homepage is opened, then go back to previous page
        assert.equal(browser.history._stack[1].url.href, urlGoogle + "/");
        return browser.back();
      })
      .then(function() { //shorten existing url with past expiration time
        browser.fill("originalUrl", urlGoogle);
        browser.fill("#expire_at", expiredDate);
        return browser.pressButton("#url_submit");
      })
      .then(function() {
        lastStep = true;
        assert.ok(browser.text(':contains("URL is expired successfully.")'));
        assert.equal(site + "/KEY", browser.text("#short_url"));
        assert.equal(site + "/", browser.query("#short_url")._attributes.href._nodeValue);
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

  it("invalid url", function(done) {
    browser
      .visit(site)
      .then(function() {
        browser.fill("originalUrl", "www.google.com");
        return browser.pressButton("#url_submit");
      })
      .then(function() {
        assert.equal(browser.text("#alert_error"), "The URL entered is invalid.");
        browser.fill("originalUrl", urlGoogle);
        return browser.pressButton("#url_submit");
      })
      .then(function() {
        assert.equal(browser.query("#alert_error")._cssStyleDeclaration._values.display, "none");
      })
      .then(function() { //delete url
        browser.fill("#expire_at", expiredDate);
        return browser.pressButton("#url_submit");
      })
      .then(function() {
        assert.ok(browser.text(':contains("URL is expired successfully.")'));
        assert.equal(site + "/KEY", browser.text("#short_url"));
        assert.equal(site + "/", browser.query("#short_url")._attributes.href._nodeValue);
      })
      .then(done, done);
  });
});
