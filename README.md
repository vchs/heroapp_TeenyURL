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

Set environment variable `REDIS_CONN` to be `redis://host:port` or `redis://host:port/db` to enable
functional tests for `RedisCacheProvider`. E.g.

```bash
REDIS_CONN=redis://localhost:6379/1 ./test.sh
```
