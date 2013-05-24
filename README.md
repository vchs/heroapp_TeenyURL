[![Build Status](https://travis-ci.org/vmw-tmpst/heroapp-TeenyURL.png?branch=master)](https://travis-ci.org/vmw-tmpst/heroapp-TeenyURL)

#What's TeenyURL?
--------------
TeenyURL is a very cool web application. It turns a very long URL into a much shorter one. Then you use the shorter one in your blog post and email. When someone click it, teenyURL application can help you redirect to the long one.

#Introduction of techniques
--------------

Teenyurl is written with node.js and express framework. It can run either on Platform such as VMware Tempest or Cloud Foundry, or in your local box. It uses PostgreSql preferably to store persistent data, and Redis as cache (optional). But the service binding logic is well-designed so you can easily bind it to other services such as mongodb, mysql etc.

__Node.js__ is a server-side software system designed for writing scalable Internet applications, notably web servers. The teenyURL is a simple application. So it uses the node.js to implement the backend services which access the PostgreSql database and Redis cache server and exposes several RESTful APIs. 

__Express__: is a minimal and flexible node.js web application framework, providing a robust set of features for building single and multi-page, and hybrid web applications.

__PostgreSql__ is used to act as the RDMS, to persist the URL mapping data.

__Redis__ is used to act as the high speed cache server. When user access the shorter URL, we can get the mapped long URL in redis very quickly.

For the frontend, the teenyURL is a typical one page application. It uses bootstrap css library to style the page and jquery ui timepicker addon. 

#Run app on Tempest or Cloud Foundry
--------------
`App` Folder contains code for the web app. File `manifest.yml` in this folder already contains the info needed so you can directly push the app to Tempest/Cloud Foundry.

You can always customize the manifest such as binding services with different names. We recommend you change service name by adding suffix, such as add `-qa` for test app. In this way, new names still contain the earlier prefix, on which our code relies to bind the service. For example, for PostgreSql service, service names should be prefixed with 'teenyurl-postgres'.

##Bind to Tempest or CF services

Tempest or Cloud Foundry provide the environment variable for node.js application to bind the server port and services(PostgreSql or Redis) configration.

The environment variables are VCAP_APP_PORT and VCAP_SERVICES. You can take a look how we parse the variables in the [app/app.js](https://github.com/vmw-tmpst/heroapp-TeenyURL/blob/master/app/app.js) and [app/lib/ServiceBinding.js](https://github.com/vmw-tmpst/heroapp-TeenyURL/blob/master/app/lib/ServiceBinding.js).

Another example: [Using Cloud Foundry MongoDB services from Node.js applications](http://docs.cloudfoundry.com/services/mongodb/nodejs-mongodb.html)


#Run app in your local box
--------------

##Backend Service Setup


To use redis as cache, you need start a redis server
```bash
redis-server
```

Start your postgresql server and create a database 'teenyurl'.
We assume your postgresql process is running under account 'postgres'.

```bash
createdb -U postgres teenyurl
```

Current postgres adapter doesn't support unix socket. It uses TCP right now. This works the same as on Tempest environment.
For local testing, if you want to use 'postgres' as username without providing password, please edit `pg_hba.conf` and add the following line:

```
host all postgres 127.0.0.1/32 trust
```

##Environment setup for the app or test

To use services such as Redis/PostgreSql, an environment variable VCAP_SERVICES need be set before starting the app or running the functional test. We provide several shell script files you can choose to set the intended environment variable.

```bash
source ./env/local-postgres.sh
```
Note: we assume your postgresql process runs under account 'postgres'.  If not, please update the preconfigured 'username' within ./local-postgres.sh accordingly.

You can also specify the environment variable the time running the app or test.

```bash
VCAP_SERVICES='{ "redis": [{"name": "teenyurl-redis-cache-prod", "credentials": { "host": "YOUR_REDIS_HOST", "port": YOUR_REDIS_PORT, "password": "YOUR_REDIS_PASSWORD" } }] , "postgres": [{"name" : "teenyurl-postgres-prod", "credentials" : { "database" : "teenyurl", "username" : "postgres" }}] }' COMMAND
```

Please be noted: `VCAP_SERVICES` is an hash in JSON format. One item within the hash specifies one service.

##How to run app
After setting environment variables, go to `app` folder, and type `npm install` for the first time

Launch the web app.

```bash
npm start
```

or

```bash
node app
```

##How to run test


Go to `test` folder, and type `npm install` for the first time.

###Unit Tests
----------------
```bash
npm test
```
By default, it will run all unit tests, using mocha.

###Functional Tests
----------------

By providing different VCAP_SERVICES value, you can decide whether to run functional tests for certain components.
Take a look at `helpers.js`, and uses `when(condition).describe(...)` to enable a certain set of tests conditionally, just as we did in file `SqlDataAccessor-func-test.js`.

For example, to test only functional testcases for `RedisCache` but skip those for `PostgreSQL`, set environment variable `VCAP_SERVICES` to be

```bash
VCAP_SERVICES='{ "redis": [{"name": "teenyurl-redis-cache", "credentials": { "host": "YOUR_REDIS_HOST", "port": YOUR_REDIS_PORT, "password": "YOUR_REDIS_PASSWORD" } }] }' ./test.sh
```

You can also source files from `env` folder.