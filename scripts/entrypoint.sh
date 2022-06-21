#!/bin/sh

set -e

echo -n 'Waiting for the docker daemon to start.'

dockerd-entrypoint.sh &> /dev/null &
# wait for docker startup
while ! docker-entrypoint.sh info &> /dev/null
do 
    sleep 1s
    echo -n '.'
done

echo "The docker daemon has started."

exec "$@"
