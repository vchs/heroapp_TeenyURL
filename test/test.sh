#!/bin/sh

TEST_FILES="$@"
[ -z "$TEST_FILES" ] && TEST_FILES="$(find . -name '*-test.js')"
./node_modules/.bin/mocha --reporter list -r mootools $TEST_FILES
