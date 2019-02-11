#!/bin/bash

#set the list of images to be removed from the docker
DELETE_IMAGES=(gql_postgres gql_science_db_graphql_server gql_ncbi_sim_srv)
while [[ $# -gt 0 ]]
do
    key="$1"

    case $key in
        -k|--keep-image)
        DELETE_IMAGES=("${DELETE_IMAGES[@]/$2}") #+=("$2")
        shift # past argument
        shift # past value
        ;;
        *)    # unknown option
        echo "unknown option: $key"
        exit 1
        ;;
    esac
done

# Stop the GraphQL web server, delete the Docker containers and volume, but
# leave the image. Finally delete the generated code.
function cleanup {

    docker-compose -f ./docker/docker-compose-test.yml down -v

    for IMAGE in "${DELETE_IMAGES[@]}"
    do
        if ! [[ -z "${IMAGE// }" ]]; then
            IN_ID=`docker images | grep "$IMAGE"`
            if ! [[ -z "${IN_ID// }" ]]; then
             echo "Delete image: $IMAGE"
             echo "$IN_ID" | awk '{print "docker rmi -f " $3}' | sh
            fi
        fi
    done

    rm -rf ./docker/integration_test_run/models
    rm -rf ./docker/integration_test_run/models-webservice
    rm -rf ./docker/integration_test_run/migrations
    rm -rf ./docker/integration_test_run/schemas
    rm -rf ./docker/integration_test_run/resolvers
}

cleanup

# Generate the code for the integration test models
node ./index.js generate ./test/integration-test-input ./docker/integration_test_run
patch -V never ./docker/integration_test_run/resolvers/aminoacidsequence.js ./docker/ncbi_sim_srv/amino_acid_sequence_resolver.patch

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

mocha ./test/test-integration.js

cleanup