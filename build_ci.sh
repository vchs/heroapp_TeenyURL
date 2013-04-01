#!/bin/sh
set -x
cd app
npm install
cd ..
cd test
npm install
export VCAP_SERVICES='{ "postgres": [{"name" : "teenyurl-postgres", "credentials" : { "database" : "teenyurl", "username" : "postgres" }}], "redis": [{"name": "teenyurl-redis-cache", "credentials": { "host": "localhost", "port": 6379, "password": "" } }]}'
./test.sh
cd ..
cd ui-automation
npm install
./test.sh

