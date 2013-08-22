var Browser  = require("zombie"),
    async    = require("async"),
    assert   = require("assert"),
    strftime = require('strftime');

function expects(fn, handler, final) {
    try {
        fn();
    } catch (e) {
        handler(e);
    }
    if (final) {
        handler();
    }
}

describe("Teeny URL UI automation - ", function() {
    console.log(process.env.SITE);
    var SITE = process.env.SITE || "http://localhost:3000";
    console.log(SITE);
    var ORIGINAL_URL = "http://www.google.com";
    var INVALID_URL  = "invalidUrl";
    var EXPIRED_DATE = "01/01/2012 00:00";
    
    var browser;
    
    beforeEach(function () {
        browser = new Browser();
    });
  
    it("check wording on homepage", function(done) {
        browser.on("error", done)
            .visit(SITE) //visit homepage and check related items
            .then(function() {
                assert.ok(browser.success);
                assert.equal(browser.text("title"), "Tempest TeenyUrl");
                assert.ok(browser.text(':contains("TeenyURL")'));
                assert.ok(browser.text(':contains("Paste your long URL here (http and https OK):")'));
                assert.ok(browser.text(':contains("The shortened URL will expire at")'));
                assert.ok(browser.text(':contains("Shorten")'));
                assert.ok(browser.query("#copy_button"));
                assert.equal(SITE + "/KEY", browser.text("#short_url"));
                assert.equal(SITE + "/", browser.query("#short_url")._attributes.href._nodeValue);
            })
            .then(done, done);
    });

    it("add new url without expiration time", function(done) {
        var alternativeUrl;
      
        async.series([
            function (next) {
                browser.visit(SITE, next);
            },
            function (next) {
                //shorten original url
                browser
                    .fill("originalUrl", ORIGINAL_URL)
                    .pressButton("#url_submit", next);
            },
            function (next) {
                alternativeUrl = browser.text("#short_url");
                expects(function () {
                    assert.equal(alternativeUrl, browser.query("#short_url")._attributes.href._nodeValue);
                    browser.clickLink("#short_url", next);
                }, next);
            },
            function (next) {
                expects(function () {
                    assert.equal(browser.history._stack[1].url.href, ORIGINAL_URL + "/");
                    browser.back(next);
                }, next);
            },
            function (next) {
                browser
                    .fill("originalUrl", ORIGINAL_URL)
                    .fill("#expire_at", EXPIRED_DATE)
                    .pressButton("#url_submit", next);
            },
            function (next) {
                expects(function () {
                    assert.ok(browser.text(':contains("URL is expired successfully.")'));
                    assert.equal(SITE + "/KEY", browser.text("#short_url"));
                    assert.equal(SITE + "/", browser.query("#short_url")._attributes.href._nodeValue);
                    browser.visit(alternativeUrl, function () {
                        // we expect browser gets an error 404
                        next();
                    });
                }, next);
            },
            function (next) {
                expects(function () {
                    assert.equal(browser.statusCode, 404);
                }, next, true);
            }
        ], done);
    });

    it("add new url with future expiration time", function(done) {
        var alternativeUrl, futureTime;
    
        async.series([
            function (next) {
                browser.visit(SITE, next);
            },
            function (next) {
                var now = new Date();
                var delay = now.getSeconds() > 50 ? 10000 : 0;
                setTimeout(function () {
                    now = new Date();
                    futureTime = new Date(Math.floor((now.valueOf() / 1000 + 60) * 1000));
                    browser
                        .fill("originalUrl", ORIGINAL_URL)
                        .fill("#expire_at", strftime("%m/%d/%Y %H:%M", futureTime))
                        .pressButton("#url_submit", next);
                }, delay);
            },
            function (next) {
                alternativeUrl = browser.query("#short_url").childNodes[0]._nodeValue;
                browser.clickLink("#short_url", next);
            },
            function (next) {
                expects(function () {
                    assert.equal(browser.history._stack[1].url.href, ORIGINAL_URL + "/");
                    var delay = futureTime.valueOf() - Date.now();
                    if (delay < 0) {
                        delay = 0;
                    }
                    setTimeout(function () {
                        browser.visit(alternativeUrl, function () {
                            // expects 404
                            next();
                        });
                    }, delay + 5000);
                }, next);
            },
            function (next) {
                expects(function () {
                    assert.equal(browser.statusCode, 404);
                }, next, true);
            }
        ], done);
    });

    it("add new url with past expiration time", function(done) {
        async.series([
            function (next) {
                browser.visit(SITE, next);
            },
            function (next) {
                browser
                    .fill("originalUrl", ORIGINAL_URL)
                    .fill("#expire_at", EXPIRED_DATE)
                    .pressButton("#url_submit", next);
            },
            function (next) {
                expects(function () {
                    assert.ok(browser.text(':contains("URL is expired successfully.")'));
                    assert.equal(SITE + "/KEY", browser.text("#short_url"));
                    assert.equal(SITE + "/", browser.query("#short_url")._attributes.href._nodeValue);
                }, next, true);
            }
        ], done);
    });

    it("add existing url without expiration time", function(done) {
        var alternativeUrl;
        
        async.series([
            function (next) {
                browser.visit(SITE, next);
            },
            function (next) {
                browser
                    .fill("originalUrl", ORIGINAL_URL)
                    .pressButton("#url_submit", next);
            },
            function (next) {
                alternativeUrl = browser.text("#short_url");
                expects(function () {
                    assert.equal(alternativeUrl, browser.query("#short_url")._attributes.href._nodeValue);
                    browser.clickLink("#short_url", next);
                }, next);
            },
            function (next) {
                //check google homepage is opened, then go back to previous page
                expects(function () {
                    assert.equal(browser.history._stack[1].url.href, ORIGINAL_URL + "/");
                    browser.back(next);
                }, next);
            },
            function (next) {
                //shorten existing original url
                browser
                    .fill("originalUrl", ORIGINAL_URL)
                    .pressButton("#url_submit", next);
            },
            function (next) {
                //click original alternative url
                browser.clickLink("#short_url", next);
            },
            function (next) {
                expects(function () {
                    assert.equal(browser.history._stack[1].url.href, ORIGINAL_URL + "/");
                    browser.back(next);
                }, next);
            },
            function (next) {
                //delete original alternative url
                browser
                    .fill("originalUrl", ORIGINAL_URL)
                    .fill("#expire_at", EXPIRED_DATE)
                    .pressButton("#url_submit", next);
            },
            function (next) {
                expects(function () {
                    assert.ok(browser.text(':contains("URL is expired successfully.")'));
                    assert.equal(SITE + "/KEY", browser.text("#short_url"));
                    assert.equal(SITE + "/", browser.query("#short_url")._attributes.href._nodeValue);
                    browser.visit(alternativeUrl, function () {
                        // expect 404
                        next();
                    });
                }, next);
            },
            function (next) {
                expects(function () {
                    assert.equal(browser.statusCode, 404);
                }, next, true);
            }
        ], done);
    });

    it("add existing url with future expiration time", function(done) {
        var alternativeUrl, futureTime;

        async.series([
            function (next) {
                browser.visit(SITE, next);
            },
            function (next) {
                browser
                    .fill("originalUrl", ORIGINAL_URL)
                    .pressButton("#url_submit", next);
            },
            function (next) {
                browser.clickLink("#short_url", next);
            },
            function (next) {
                //check original url homepage is opened, then go back to previous page
                expects(function () {
                    assert.equal(browser.history._stack[1].url.href, ORIGINAL_URL + "/");
                    browser.back(next);
                }, next);
            },
            function (next) {
                var now = new Date();
                var delay = now.getSeconds() > 50 ? 10000 : 0;
                setTimeout(function () {
                    futureTime = new Date(Math.floor((now.valueOf() / 1000 + 60) * 1000));
                    browser
                        .fill("originalUrl", ORIGINAL_URL)
                        .fill("#expire_at", strftime("%m/%d/%Y %H:%M", futureTime))
                        .pressButton("#url_submit", next);
                }, delay);
            },
            function (next) {
                alternativeUrl = browser.query("#short_url").childNodes[0]._nodeValue;
                browser.clickLink("#short_url", next);
            },
            function (next) {
                expects(function () {
                    assert.equal(browser.history._stack[1].url.href, ORIGINAL_URL + "/");
                    var delay = futureTime.valueOf() - Date.now();
                    if (delay < 0) {
                        delay = 0;
                    }
                    setTimeout(function () {
                        browser.visit(alternativeUrl, function () {
                            // expects 404
                            next();
                        });
                    }, delay + 5000);
                }, next);
            },
            function (next) {
                expects(function () {
                    assert.equal(browser.statusCode, 404);
                }, next, true);
            }
        ], done);
    });

    it("add existing url with past expiration time", function(done) {
        var alternativeUrl;
        
        async.series([
            function (next) {
                browser.visit(SITE, next);
            },
            function (next) {
                browser
                    .fill("originalUrl", ORIGINAL_URL)
                    .pressButton("#url_submit", next);
            },
            function (next) {
                alternativeUrl = browser.text("#short_url");
                browser.clickLink("#short_url", next);
            },
            function (next) {
                //check original url homepage is opened, then go back to previous page
                expects(function () {
                    assert.equal(browser.history._stack[1].url.href, ORIGINAL_URL + "/");
                    browser.back(next);
                }, next);
            },
            function (next) {
                //shorten existing url with past expiration time
                browser
                    .fill("originalUrl", ORIGINAL_URL)
                    .fill("#expire_at", EXPIRED_DATE)
                    .pressButton("#url_submit", next);
            },
            function (next) {
                expects(function () {
                    assert.ok(browser.text(':contains("URL is expired successfully.")'));
                    assert.equal(SITE + "/KEY", browser.text("#short_url"));
                    assert.equal(SITE + "/", browser.query("#short_url")._attributes.href._nodeValue);
                    browser.visit(alternativeUrl, function () {
                        // expect 404
                        next();
                    });
                }, next);
            },
            function (next) {
                expects(function () {
                    assert.equal(browser.statusCode, 404);
                }, next, true);
            }
        ], done);
    });

    it("invalid url", function(done) {
        async.series([
            function (next) {
                browser.visit(SITE, next);
            },
            function (next) {
                browser
                    .fill("originalUrl", INVALID_URL)
                    .pressButton("#url_submit", next);
            },
            function (next) {
                expects(function () {
                    assert.equal(browser.text("#alert_error"), "The URL entered is invalid.");
                    browser
                        .fill("originalUrl", ORIGINAL_URL)
                        .pressButton("#url_submit", next);
                }, next);
            },
            function (next) {
                expects(function () {
                    assert.equal(browser.query("#alert_error")._cssStyleDeclaration._values.display, "none");
                    browser
                        .fill("#expire_at", EXPIRED_DATE)
                        .pressButton("#url_submit", next);
                }, next);
            },
            function (next) {
                expects(function () {
                    assert.ok(browser.text(':contains("URL is expired successfully.")'));
                    assert.equal(SITE + "/KEY", browser.text("#short_url"));
                    assert.equal(SITE + "/", browser.query("#short_url")._attributes.href._nodeValue);
                }, next, true);
            }
        ], done);
    });
});
