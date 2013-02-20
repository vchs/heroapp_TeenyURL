#!/bin/sh

./node_modules/.bin/mocha -r mootools $(find . -name '*-test.js')
