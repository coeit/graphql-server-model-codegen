#!/bin/bash

# Use this script to stop and/or completely remove docker images
# This is useful when sh_integration_test_run.sh was executed with
# --run-docker-only option

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
        shift
        ;;
    esac
done


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
rm -rf ./docker/integration_test_run/validations
rm -rf ./docker/integration_test_run/patches
