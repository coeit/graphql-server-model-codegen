#!/bin/bash


# Intergation-test case creates a docker-compose ambient with three servers
# gql_postgres, gql_science_db_graphql_server and gql_ncbi_sim_srv. By default, after the test run,
# all corresponding images will be completely removed from the docker. However, to speed-up the development
# process it is possible to not remove the selected images. Each of the images that wou prefer to keep alive
# shell be preceeded with the -k or --keep-image key. For example:

#$ npm run test-integration -- -k gql_postgres -k gql_science_db_graphql_server -k gql_ncbi_sim_srv

# Also this script can take an optional  "--run-docker-only" parameter. In this case
# a docker will stay running and no tests will be executed automatically. This mode is useful for
# debugging purposes.


# -------------------------------------------------------------------------------------

# Stop the Docker-Compose, cleanup all generated data and delete selected docker images
PWD=`pwd`
bash -C "${PWD}/test/sh_integration_test_clear.sh" "$@"

# Generate the code for the integration test models
node ./index.js generate ./test/integration_test_models ./docker/integration_test_run

# Patch the resolver for web-server
patch -V never ./docker/integration_test_run/resolvers/aminoacidsequence.js ./docker/ncbi_sim_srv/amino_acid_sequence_resolver.patch

# Add simple sequalize validation to the Individual model
# patch -V never ./docker/integration_test_run/models/individual.js ./test/integration_test_misc/individual_validate_sequelize.patch

# Add monkey-patching validation with Joi
patch -V never ./docker/integration_test_run/validations/individual.js ./test/integration_test_misc/individual_validate_joi.patch

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


# Run tests automatically and cleanup docker or keep docker running (suitable for debugging purposes)
PARAMS="$@"
if ! [[ "$@" =~ "--run-docker-only" ]]; then

 mocha ./test/mocha_integration_test.js
 bash -C "${PWD}/test/sh_integration_test_clear.sh" "$@"

fi