#!/bin/sh

TEST_FILES="$@"
[ -z "$TEST_FILES" ] && TEST_FILES="$(find . -name '*-test.js')"
./node_modules/.bin/mocha -r mootools $TEST_FILES
