#!/bin/sh

cd ..
cd app
npm install
cd ..
cd test
npm install
TEST_FILES="$@"
[ -z "$TEST_FILES" ] && TEST_FILES="$(find . -name '*unit-test.js')"
./node_modules/.bin/mocha --reporter nyan -r mootools $TEST_FILES
