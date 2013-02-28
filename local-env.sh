# This file provides the environment needed for running TinyUrl with
# Redis and MongoDB running on localhost. Please do
#    bash> source local-env.sh
# before running the app or any functional tests.

export VMC_SERVICES='[
{"name": "tinyurl-redis-cache", "options": { "host": "localhost", "port": 6379}},
{"name" : "tinyurl-mongodb", "options" : { "url" : "mongodb://localhost/tinyurl"}}
]'
