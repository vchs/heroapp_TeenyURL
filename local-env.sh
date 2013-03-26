# This file provides the environment needed for running TeenyURL with
# Redis and MongoDB running on localhost. Please do
#    bash> source local-env.sh
# before running the app or any functional tests.

export VMC_SERVICES='[
{"name": "teenyurl-redis-cache", "options": { "host": "localhost", "port": 6379}},
{"name" : "teenyurl-mongodb", "options" : { "url" : "mongodb://localhost/teenyurl"}}
]'
