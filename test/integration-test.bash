#!/bin/bash

# Generate the code for the integration test models
node ./index.js generate ./test/integration-test-input ./docker/integration_test_run

# Setup and launch the generated GraphQL web-server
docker-compose -f ./docker/docker-compose-test.yml up -d
# TODO: Fix this manual waiting until server is launched
sleep 10

# Run the integration test suite
mocha ./test/integration-tests-mocha.js

# Stop the GraphQL web server, delete the Docker containers and volume, but
# leave the image. Finally delete the generated code.
docker-compose -f ./docker/docker-compose-test.yml down -v && \
  rm -rf ./docker/integration_test_run/models && \
  rm -rf ./docker/integration_test_run/models-webservice && \
  rm -rf ./docker/integration_test_run/migrations && \
  rm -rf ./docker/integration_test_run/schemas && \
  rm -rf ./docker/integration_test_run/resolvers
