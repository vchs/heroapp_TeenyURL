# This file provides the environment needed for running TeenyURL with
# Redis and MongoDB running on localhost. Please do
#    bash> source local-env.sh
# before running the app or any functional tests.

export VCAP_SERVICES='{
    "redis-2.6": [{"name": "teenyurl-redis-cache-prod", "credentials": { "host": "localhost", "port": 6379 } }],
    "mongo-2.0": [{"name": "teenyurl-mongodb-prod", "credentials": { "url": "mongodb://localhost/teenyurl"} }]
}'

