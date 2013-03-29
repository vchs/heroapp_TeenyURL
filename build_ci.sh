#!/bin/sh
set -x
cd app
npm install
cd ..
cd test
npm install
VCAP_SERVICES='{ "postgres": [{"name" : "teenyurl-postgres", "credentials" : { "database" : "teenyurl", "username" : "postgres" }}] }'
TEST_FILES="$@"
[ -z "$TEST_FILES" ] && TEST_FILES="$(find . -name '*-test.js' -not -name 'Mongo*')"
./node_modules/.bin/mocha --reporter nyan -r mootools $TEST_FILES
