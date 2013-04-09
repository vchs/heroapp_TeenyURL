#!/bin/sh
set -x
exitcode=0
cd app
npm install
cd ..
cd test
npm install
export VCAP_SERVICES='{ "postgres": [{"name" : "teenyurl-postgres", "credentials" : { "name" : "teenyurl", "username" : "postgres" }}], "redis": [{"name": "teenyurl-redis-cache", "credentials": { "host": "localhost", "port": 6379, "password": "" } }]}'
echo "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@   start unit tests and integration tests   @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@"
TEST_FILES="$@"
[ -z "$TEST_FILES" ] && TEST_FILES="$(find . -name '*-test.js')"
./node_modules/.bin/mocha --reporter list -r mootools $TEST_FILES || exitcode=1
echo $exitcode
cd ..
cd ui-automation
npm install
echo "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@   start UI automation tests   @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@"
TEST_FILES="$@"
[ -z "$TEST_FILES" ] && TEST_FILES="$(find . -name 'ui-test.js')"
./node_modules/.bin/mocha --timeout 80000 --reporter list -r mootools $TEST_FILES || exitcode=1
exit $exitcode
