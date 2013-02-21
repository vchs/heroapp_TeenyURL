exports.register = function (app) {
    var url = require('url');

    function validateUrl(inputUrl) {
        var protocol = url.parse(inputUrl).protocol;
        if (protocol == "http:" || protocol == "https:")
            return true;
        else
            return false;
    }
    
    app.post("/api/create", function (req, res) {
        var url = req.param('url'),
            expire = req.param('expire');
        
        console.log("url is: " + url);
        console.log("expire is: " + expire);

        // check the url
        if(validateUrl(url))
            res.send({"result":"ok"});
        else
            res.send({"result":"invalid URL."});
    });
};