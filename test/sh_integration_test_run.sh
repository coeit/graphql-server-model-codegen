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
RED='\033[0;31m'
LGREEN='\033[1;32m'
YEL='\033[1;33m'
NC='\033[0m'

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
  echo -e "@@ Deleting generated code..."
  # Remove generated code.
  for i in "${CODEGEN_DIRS[@]}"
  do
    if [ -d $i ]; then
      rm -rf $i
      if [ $? -eq 0 ]; then
          echo -e "@removed: $i"
      else
          echo -e "!!${RED}ERROR${NC}: trying to remove: $i fails"
      fi
    fi
  done
  # Msg
  echo -e "@@ Generated code deleted ... ${LGREEN}done${NC}"
}

#
# Function: restartContainers()
#
# Downs and ups containers
#
restartContainers() {
  # Msg
  echo -e "@@ Restarting containers..."
  docker-compose -f ./docker/docker-compose-test.yml down
  npm install
  docker-compose -f ./docker/docker-compose-test.yml up -d
  docker-compose -f ./docker/docker-compose-test.yml ps
  # Msg
  echo -e "@@ Containers restart ... ${LGREEN}done${NC}"
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
  echo -e "@@ Starting cleanup..."
  docker-compose -f ./docker/docker-compose-test.yml down -v --rmi all
  deleteGenCode
  # Msg
  echo -e "@@ Cleanup ... ${LGREEN}done${NC}"
}

#
# Function: lightCleanup()
#
# restart & removeCodeGen
#
lightCleanup() {
  # Msg
  echo -e "@@ Starting light cleanup..."
  docker-compose -f ./docker/docker-compose-test.yml down
  docker-compose -f ./docker/docker-compose-test.yml ps
  deleteGenCode
  # Msg
  echo -e "@@ Light cleanup ... ${LGREEN}done${NC}"
}

#
# Function: waitForGql()
#
# Waits for GraphQL Server to start, for a maximum amount of T1 seconds.
#
waitForGql() {
  # Msg
  echo -e "@@ Waiting for GraphQL server to start..."

  # Wait until the Science-DB GraphQL web-server is up and running
  waited=0
  until curl 'localhost:3000/graphql' > /dev/null 2>&1
  do
    if [ $waited == $T1 ]; then
      # Msg: error
      echo -e "!!${RED}ERROR${NC}: science-db graphql web server does not start, the wait time limit was reached ($T1).\n"
      exit 1
    fi
    sleep 2
    waited=$(expr $waited + 2)
  done

  # Msg
  echo -e "@@ GraphQL server is up! ... ${LGREEN}done${NC}"
}

#
# Function: genCode()
#
# Generate code.
#
genCode() {
  # Msg
  echo -e "@@ Generating code..."
  npm install
  node ./index.js -f ./test/integration_test_models -o ${TARGET_DIR}

  # Patch the resolver for web-server
  patch -V never ${TARGET_DIR}/resolvers/aminoacidsequence.js ./docker/ncbi_sim_srv/amino_acid_sequence_resolver.patch
  # Add monkey-patching validation with AJV
  patch -V never ${TARGET_DIR}/validations/individual.js ./test/integration_test_misc/individual_validate.patch

  # Msg
  echo -e "@@ Generating code: ... ${LGREEN}done${NC}"
}

#
# Function: upContainers()
#
# Up docker containers.
#
upContainers() {
  # Msg
  echo -e "@@ Rising up containers..."
  npm install
  docker-compose -f ./docker/docker-compose-test.yml up -d
  docker-compose -f ./docker/docker-compose-test.yml ps
  # Msg
  echo -e "@@ Containers up ... ${LGREEN}done${NC}"
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
  echo -e "@@ Starting mocha tests..."
  mocha ./test/mocha_integration_test.js
  # Msg
  echo -e "@@ Tests ... ${LGREEN}done${NC}"
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

      case $a in
        -k|--keep-running)

          # Msg
          echo -e "@@ Doing option: $a"
          # set flag
          KEEP_RUNNING=true
          # Msg
          echo -e "@@ Keep containers running at end: $KEEP_RUNNING"
          # Past argument
          shift
          let "NUM_ARGS--"
        ;;
        
        *)
          # Msg
          echo -e "@@ Discarting option: ${RED}$a${NC}"
          # Past argument
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

        # Msg
        echo -e "@@ Doing option: $1"

        case $key in
            -k|--keep-running)
              # Set flag
              KEEP_RUNNING=true
              # Msg
              echo -e "@@ keep containers running at end: $KEEP_RUNNING"
              
              # Past argument
              shift
              let "NUM_ARGS--"
            ;;

            -r|--restart-containers)
              # Restart containers
              restartContainers

              # Done
              exit
            ;;

            -g|--generate-code)
              # Light cleanup
              lightCleanup
              # Generate code
              genCode
              # Ups containers
              upContainers

              # Done
              exit
            ;;

            -t|--run-tests-only)
              # Restart containers
              restartContainers
              # Do the tests
              doTests

              # Past argument
              shift
              let "NUM_ARGS--"

              # Consume remaining arguments
              consumeArgs $@
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

              # Past argument
              shift
              let "NUM_ARGS--"

              # Consume remaining arguments
              consumeArgs $@
            ;;

            -c|--cleanup)
              # Cleanup
              cleanup

              # Done
              exit
            ;;

            *)
              # Msg
              echo -e "@@ Bad option: ... ${RED}$key${NC} ... ${YEL}exit${NC}"
              exit 1
            ;;
        esac
    done
else
# Default: no arguments
  # Cleanup
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
  echo -e "@@ Doing final cleanup..."
  # Cleanup
  cleanup
else
  # Msg
  echo -e "@@ Keeping containers running ... ${LGREEN}done${NC}"
  # List
  docker-compose -f ./docker/docker-compose-test.yml ps
fi