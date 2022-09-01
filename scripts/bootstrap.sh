#!/bin/bash
set -e

REGISTRY="ghcr.io"

NAME=$(yq '.name' balena.yml)
LOOP=$(yq '.loop' balena.yml)
TYPE=$(yq '.type' balena.yml)
VERSION=$(yq '.version' balena.yml)

IMAGE_TAG=${REGISTRY}/${LOOP}/${NAME}/${TYPE}/artifact:${VERSION}
CONTRACT_TAG=${REGISTRY}/${LOOP}/${NAME}/${TYPE}/contract:${VERSION}

# Build and push transformer image
docker login -u ${REGISTRY_USERNAME} \
    -p ${REGISTRY_PASSWORD} ${REGISTRY}
docker build -t ${IMAGE_TAG} -f Dockerfile .

# Create and push transformer contract
yq -o json balena.yml > contract.json
docker push ${IMAGE_TAG}
oras login ${REGISTRY} --username ${REGISTRY_USERNAME} \
    --password ${REGISTRY_PASSWORD}
oras push $CONTRACT_TAG \
--artifact-type ${NAME}/contract \
  ./contract.json:application/json
