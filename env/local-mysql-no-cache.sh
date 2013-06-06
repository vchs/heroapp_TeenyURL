# This file provides the environment needed for running TeenyURL with
# Redis and MongoDB running on localhost. Please do
#    bash> source local-env.sh
# before running the app or any functional tests.

export VCAP_SERVICES='{
    "mysql-5.1": [{"name": "teenyurl-mysql-prod", "credentials": { "name": "teenyurl", "username": "root" } }]
}'

