#!/bin/bash

# Stop the GraphQL web server, delete the Docker containers and volume, but
# leave the image. Finally delete the generated code.
function cleanup {
  docker-compose -f ./docker/docker-compose-test.yml down -v && \
    rm -rf ./docker/integration_test_run/models && \
    rm -rf ./docker/integration_test_run/models-webservice && \
    rm -rf ./docker/integration_test_run/migrations && \
    rm -rf ./docker/integration_test_run/schemas && \
    rm -rf ./docker/integration_test_run/resolvers
}

# Generate the code for the integration test models
node ./index.js generate ./test/integration-test-input ./docker/integration_test_run

# Setup and launch the generated GraphQL web-server
docker-compose -f ./docker/docker-compose-test.yml up -d
# Wait until the Science-DB GraphQL web-server is up and running
waited=0
until curl 'localhost:3000/graphql' > /dev/null 2>&1
do
  if [ $waited == 240 ]; then
    echo -e '\nERROR: While awaiting dockerized start-up of the Science-DB GraphQL web server, the time out limit was reached.\n'
    cleanup
    exit 1
  fi
  sleep 2
  waited=$(expr $waited + 2)
done

# Run the integration test suite

# mocha ./test/test-integration.js

# cleanup
