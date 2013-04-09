var Sequelize = require("sequelize-postgres").sequelize;

module.exports = new Class({
    
    initialize: function (dialect, connInfo) {
        this.sequelize = new Sequelize(connInfo.name, connInfo.username, connInfo.password, {
                                        host: connInfo.host,
                                        port: connInfo.port,
                                        dialect: dialect,
                                        logging: false,
                                        define: {
                                            timestamps: false
                                        }
                                    });

        this.ShortUrl = this.sequelize.define("ShortUrl", {
            // the key generated uniquely for the original URL: http://teenyurl/key
            key: { type: Sequelize.STRING, primaryKey: true },
            // the original URL the key mapped to
            originalUrl: { type: Sequelize.TEXT, unique: true, allowNull: false },
            // when the mapping expires
            expireAt: { type: Sequelize.DATE, defaultValue: null }
        }, {
            instanceMethods: {
                updateWhenChanged: function (dataObject, callback) {
                    if (this.expireAt != dataObject.expireAt) {
                        this.updateAttributes({ expireAt: dataObject.expireAt })
                            .error(callback)
                            .success(function () {
                                callback(null, dataObject);
                            });
                    } else {
                        callback(null, dataObject);
                    }
                    return this;
                }
            }
        });
    },
    
    // implement IDataAccessor
    
    ready: function (callback) {
        this.sequelize.sync().done(function (errs) {
            // Postgres 9.0 workaround: SQL "CREATE TABLE IF NOT EXISTS ..." not supported
            if (this.sequelize.options.dialect == "postgres" &&
                Array.isArray(errs) && errs.some(function (err) {
                    return err.name == "error" && err.code === '42601';
                })) {
                this.sequelize.query('CREATE TABLE "ShortUrls" ("key" VARCHAR(255) , "originalUrl" TEXT NOT NULL UNIQUE, "expireAt" TIMESTAMP WITH TIME ZONE DEFAULT NULL, PRIMARY KEY ("key"));')
                        .done(function (err) {
                            if (err && err.code === '42P07') {
                                err = null;
                            }
                            callback(err);
                        });
            } else {
                callback(errs);
            }
        }.bind(this));
    },
    
    create: function (dataObject, keyGenFn, callback) {
        var ShortUrl = this.ShortUrl;
        ShortUrl.find({ where: { originalUrl: dataObject.originalUrl } })
            .error(callback)
            .success(function (shortUrl) {
                if (shortUrl) {
                    // original URL exists, update expiration only when necessary
                    dataObject.key = shortUrl.key;
                    shortUrl.updateWhenChanged(dataObject, callback);
                } else {
                    // add a new mapping, generate key first
                    keyGenFn(dataObject, function (err, key) {
                        if (err) {
                            callback(err);
                        } else {
                            dataObject.key = key;
                            ShortUrl.findOrCreate({ originalUrl: dataObject.originalUrl }, { key: key, expireAt: dataObject.expireAt })
                                .error(callback)
                                .success(function (shortUrl) {
                                    shortUrl.updateWhenChanged(dataObject, callback);
                                });
                        }
                    });
                }
            });
    },
    
    fetch: function (key, callback) {
        this.ShortUrl.find(key)
                .error(callback)
                .success(function (shortUrl) {
                    if (shortUrl && shortUrl.expireAt && shortUrl.expireAt <= new Date()) {
                        shortUrl = null;
                    }
                    callback(null, shortUrl ? shortUrl.values : null);
                });
    }
});
