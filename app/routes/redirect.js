exports.register = function (app) {
    app.get("/:key", function (req, res) {
        var key = req.params.key;
        console.log("key is: " + key);
        res.redirect('http://www.baidu.com');
    });
};