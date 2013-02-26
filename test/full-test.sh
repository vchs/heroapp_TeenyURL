#!/bin/sh

export VMC_SERVICES='[{"name": "tinyurl-redis-cache", "options": { "host": "localhost", "port": 6379}},
                {"name" : "tinyurl-mongodb", "options" : { "url" : "mongodb://localhost/tinyurl"}}]'

./test.sh "$@"
