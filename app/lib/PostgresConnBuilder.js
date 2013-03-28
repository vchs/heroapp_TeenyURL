module.exports = function() {
    var connInfo = require('./ServiceBinding').postgres;
    if (connInfo == null)
        throw new Error("No service binding for Postgres");
    var Schema = require("jugglingdb").Schema;
    return new Schema('postgres', connInfo);
};
