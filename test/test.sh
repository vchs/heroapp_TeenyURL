#!/bin/sh

./node_modules/.bin/mocha $(find . -name '*-test.js')
