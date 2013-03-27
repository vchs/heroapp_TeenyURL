[![Build Status](https://travis-ci.org/vmw-tmpst/heroapp-TeenyURL.png?branch=master)](https://travis-ci.org/vmw-tmpst/heroapp-TeenyURL)

HOW-TO
======


How to run app
--------------

Go to `app` folder, and type `npm install` for the first time, and then get your redis and postgresql server running.
Start your redis server
    ./redis-server
Start your postgresql server and create a database 'teenyurl'.
    We assume your postgresql process is running under account 'postgres'. If not, please use correct role and update the preconfigured 'username' within ./local_env.sh accordingly.
    psql postgres -c 'CREATE EXTENSION "adminpack";' 
    psql postgres -c 'CREATE DATABASE "teenyurl";' 

After redis and postgresql can be connected, type `node app` to launch the server.

How to run test
---------------

Go to `test` folder, and type `npm install` for the first time,
and then type `./test.sh` to run all the tests.
Any test should be written in the file after the name pattern `*-test.js`.

To run a single test file or a specific set of tests, type `./test.sh test-files`. E.g.

```bash
./test.sh skeleton-test.js
```

Functional Tests
----------------

The developer of the tests can decide whether to skip functional tests.
Take a look at `helpers.js`, using `when(condition).describe(...)` to enable a certain set of tests conditionally.
`./test.sh` will run all the tests including unit tests and functional tests.

### Functional Tests for RedisCacheProvider

To enable functional tests for `RedisCacheProvider`, set environment variable `VMC_SERVICES` to be

```bash
VMC_SERVICES='[{"name": "teenyurl-redis-cache", "options": { "host": "YOUR_REDIS_HOST", "port": YOUR_REDIS_PORT, "password": "YOUR_REDIS_PASSWORD" }}]' ./test.sh
```

Please be noted: `VMC_SERVICES` is an array in JSON, to enable functional tests for `RedisCacheProvider` the element with `teenyurl-redis-cache` as `name` should be present.

### Functional Tests for PostgresDataAccessor

To enable functional tests for `PostgresDataAccessor`, set environment variable `VMC_SERVICES` to be

```bash
VMC_SERVICES='[{"name" : "teenyurl-postgres", "options" : { "database" : "teenyurl", "username" : "postgres" }}]' ./test.sh
```

Please be noted: `VMC_SERVICES` is an array in JSON, to enable functional tests for `PostgresDataAccessor` the element with `teenyurl-postgres` as `name` should be present.

Run app or tests on local box
-----------------------------

If you installed Redis and MongoDB on local box, you can run app and functional tests locally:

To launch the app:

```bash
source local-env.sh
cd app
node app
```

To run with all functional tests:

```bash
source local-env.sh
cd test
./test.sh
```
