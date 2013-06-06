#!/bin/sh
set -x
set -e
npm install
. env/local-all-for-test.sh
npm test
. env/local-mysql.sh
npm start &
sleep 3
./node_modules/.bin/mocha --timeout 80000 --reporter list -r mootools test/ui/*-test.js
