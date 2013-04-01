#!/bin/sh

TEST_FILES="$@"
[ -z "$TEST_FILES" ] && TEST_FILES="$(find . -name 'ui-test.js')"
./node_modules/.bin/mocha --timeout 80000 --reporter list -r mootools $TEST_FILES
