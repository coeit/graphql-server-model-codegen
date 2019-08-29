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


#
# NAME
#     sh_integration_test_run.sh
#
# SYNOPSIS
#
#   Direct execution:
#     ./sh_integration_test_run.sh [OPTION]
#
#   Execution via npm:
#     npm run test-integration [OPTION]
#
# DESCRIPTION
#     Bash script utility to perform integration test operations.
#
#     Note: This utility uses docker and docker-compose commands, so it needs to be running with sudo if user is not in the docker's group.
#
#     The options are as follows:
#
#     -r, --restart-containers
#         ##description
#
#     -g, --generate-code
#         ##description
#
#     -t, --run-test-only
#         ##description
#
#     -T, --generate-code-and-run-tests
#         ##description
#
#     -k, --keep-running
#         ##description
#
#     -c, --cleanup
#         ##description    
#

# exit on first error
set -e

#
# Constants
#
DOCKER_SERVICES=(gql_postgres \
                 gql_science_db_graphql_server \
                 gql_ncbi_sim_srv)
TARGET_DIR="./docker/integration_test_run"
CODEGEN_DIRS=("./docker/integration_test_run/models" \
              "./docker/integration_test_run/models-webservice" \
              "./docker/integration_test_run/migrations" \
              "./docker/integration_test_run/schemas" \
              "./docker/integration_test_run/resolvers" \
              "./docker/integration_test_run/validations" \
              "./docker/integration_test_run/patches")
T1=120
KEEP_RUNNING=false
NUM_ARGS=$#

#
# Functions
#

#
# Function: deleteGenCode()
#
# Delete generated code.
#
deleteGenCode() {
  # Msg
  echo "@@ Deleting generated code..."
  # Remove generated code.
  for i in "${CODEGEN_DIRS[@]}"
  do
    if [ -d $i ]; then
      rm -rf $i
      if [ $? -eq 0 ]; then
          echo "@removed: $i"
      else
          echo "!ERROR: trying to remove: $i"
      fi
    fi
  done
  # Msg
  echo "@@ Generated code deleted: done"
}

#
# Function: restartContainers()
#
# Downs and ups containers
#
restartContainers() {
  # Msg
  echo "@@ Restarting services..."
  docker-compose -f ./docker/docker-compose-test.yml down
  npm install
  docker-compose -f ./docker/docker-compose-test.yml up -d
  docker-compose -f ./docker/docker-compose-test.yml ps
  # Msg
  echo "@@ Restart: done"
}

#
# Function: cleanup()
#
# Default actions (without --keep-running):
#   Remove docker items (containers, images, etc.).
#   Remove generated code.
#
cleanup() {
  # Msg
  echo "@@ Cleanup: start"
  docker-compose -f ./docker/docker-compose-test.yml down -v --rmi all
  deleteGenCode
  # Msg
  echo "@@ Cleanup: done"
}

#
# Function: lightCleanup()
#
# restart & removeCodeGen
#
lightCleanup() {
  # Msg
  echo "@@ Light cleanup: start"
  docker-compose -f ./docker/docker-compose-test.yml down
  docker-compose -f ./docker/docker-compose-test.yml ps
  deleteGenCode
  # Msg
  echo "@@ Light cleanup: done"
}

#
# Function: waitForGql()
#
# Waits for GraphQL Server to start, for a maximum amount of T1 seconds.
#
waitForGql() {
  # Msg
  echo "@@ Waiting for GraphQL server: start"

  # Wait until the Science-DB GraphQL web-server is up and running
  waited=0
  until curl 'localhost:3000/graphql' > /dev/null 2>&1
  do
    if [ $waited == $T1 ]; then
      # Msg: error
      echo -e "!!ERROR: science-db graphql web server does not start, the wait time limit was reached ($T1).\n"
      exit 1
    fi
    sleep 2
    waited=$(expr $waited + 2)
  done

  # Msg
  echo "@@ GraphQL server is up!: done"
}

#
# Function: genCode()
#
# Generate code.
#
genCode() {
  # Msg
  echo "@@ Generating code..."
  npm install
  node ./index.js -f ./test/integration_test_models -o ${TARGET_DIR}

  # Patch the resolver for web-server
  patch -V never ${TARGET_DIR}/resolvers/aminoacidsequence.js ./docker/ncbi_sim_srv/amino_acid_sequence_resolver.patch
  # Add monkey-patching validation with AJV
  patch -V never ${TARGET_DIR}/validations/individual.js ./test/integration_test_misc/individual_validate.patch

  # Msg
  echo "@@ Generating code: done"
}

#
# Function: upContainers()
#
# Up docker containers.
#
upContainers() {
  # Msg
  echo "@@ Rising up containers..."
  npm install
  docker-compose -f ./docker/docker-compose-test.yml up -d
  docker-compose -f ./docker/docker-compose-test.yml ps
  # Msg
  echo "@@ Containers up: done"
}

#
# Function: doTests()
#
# Do the mocha integration tests.
#
doTests() {

  # Wait for graphql server
  waitForGql

  # Msg
  echo "@@ Starting mocha tests"
  mocha ./test/mocha_integration_test.js
  # Msg
  echo "@@ Tests: done"
}

#
# Function: consumeArgs()
#
# Shift the remaining arguments on $# list, and sets the flag KEEP_RUNNING=true if
# argument -k or --keep-running is found. 
#
consumeArgs() {

  while [[ $NUM_ARGS -gt 0 ]]
  do
      a="$1"

      # Msg
      echo "@debug@ consuming arg: $a"

      case $a in
        -k|--keep-running)
          # set flag
          KEEP_RUNNING=true

          # done
          let "NUM_ARGS=0"
        ;;
        
        *)
          # past argument
          shift
          let "NUM_ARGS--"
        ;;
      esac
  done
}

#
# Main
#
if [ $# -gt 0 ]; then
    #Processes comand line arguments.
    while [[ $NUM_ARGS -gt 0 ]]
    do
        key="$1"

        ##debug
        echo "@debug@ Doing: $1"

        case $key in
            -k|--keep-running)
              # set flag
              KEEP_RUNNING=true
              
              # past argument
              shift
            ;;

            -r|--restart-containers)
              # Restart containers
              restartContainers

              # done
              exit
            ;;

            -g|--generate-code)
              # Light cleanup
              lightCleanup
              # Generate code
              genCode
              # Ups containers
              upContainers

              # done
              exit
            ;;

            -t|--run-tests-only)
              # Restart containers
              restartContainers
              # Do the tests
              doTests

              # consume remaining arguments
              consumeArgs $@

              echo "@@@debug: NUM_ARGS: $NUM_ARGS"
            ;;

            -T|--generate-code-and-run-tests)
              # Light cleanup
              lightCleanup
              # Generate code
              genCode
              # Up containers
              upContainers
              # Do the tests
              doTests

              # consume remaining arguments
              consumeArgs $@
            ;;

            -c|--cleanup)
              # Cleanup
              cleanup

              #done
              exit
            ;;

            *)
              # Show warning
              echo "@@ Unknown option_ $key"
              echo "unknown option: $key"
              exit 1
            ;;
        esac
    done
else
#default: no arguments
  # cleanup
  cleanup
  # Generate code
  genCode
  # Ups containers
  upContainers
  # Do the tests
  doTests
fi

#
# Clean up
#
if [ $KEEP_RUNNING = false ]; then

  # Msg
  echo "@@ Doing final cleanup"
  # Cleanup
  cleanup
else
  # Msg
  echo "@@ Keeping containers running..."
  # List
  docker-compose -f ./docker/docker-compose-test.yml ps
fi