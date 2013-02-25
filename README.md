HOW-TO
======

How to run app
--------------

Go to `app` folder, and type `npm install` for the first time,
and then type `node app` to lunch the server.

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
VMC_SERVICES='[{"name": "tinyurl-redis-cache", "options": { "host": "YOUR_REDIS_HOST", "port": YOUR_REDIS_PORT, "password": "YOUR_REDIS_PASSWORD" }}]' ./test.sh
```

Please be noted: `VMC_SERVICES` is an array in JSON, to enable functional tests for `RedisCacheProvider` the element with `tinyurl-redis-cache` as `name` should be present.

### Functional Tests for MongoDBDataAccessor

To enable functional tests for `MongoDBDataAccessor`, set environment variable `VMC_SERVICES` to be

```bash
VMC_SERVICES='[{"name" : "tinyurl-mongodb", "options" : { "url" : "mongodb://localhost/test"}}]' ./test.sh
```

Please be noted: `VMC_SERVICES` is an array in JSON, to enable functional tests for `MongoDBDataAccessor` the element with `tinyurl-mongodb` as `name` should be present.


