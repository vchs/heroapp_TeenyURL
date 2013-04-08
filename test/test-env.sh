# This file provides the environment needed for running TeenyURL with
# Redis and MongoDB running on localhost. Please do
#    bash> source local-env.sh
# before running the app or any functional tests.

export VCAP_SERVICES='{
    "redis-2.4": [{"name": "teenyurl-redis-cache", "credentials": { "host": "localhost", "port": 6379 } }],
    "postgres-9.1": [{"name": "teenyurl-postgres", "credentials": { "name": "teenyurl", "username": "postgres"} }],
    "mongo-2.0": [{"name": "teenyurl-mongodb", "credentials": { "url": "mongodb://localhost/teenyurl"} }]
}'

