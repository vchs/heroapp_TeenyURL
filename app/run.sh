#!/bin/sh

VMC_SERVICES='[{"name": "tinyurl-redis-cache", "options": { "host": "localhost", "port": 6379}},
                {"name" : "tinyurl-mongodb", "options" : { "url" : "mongodb://localhost/tinyurl"}}]'

export VMC_SERVICES

node app