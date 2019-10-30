#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#
# Exit on first error, print all commands.
set -e

# Shut down the Docker containers for the system tests.
docker-compose -f docker-compose.yaml -f docker-compose-couch.yaml kill && docker-compose -f docker-compose.yaml -f docker-compose-couch.yaml down

# remove chaincode docker images
docker rm $(docker ps -a | grep certificate | awk '{print $1}')
docker rmi $(docker images dev-* -q)

# Your system is now clean
