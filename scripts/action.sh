#!/bin/bash
set -e

cd ${GITHUB_ACTION_PATH}
npm install --include=dev

export APP_PATH="${GITHUB_ACTION_PATH}"
export INPUT_PATH="${GITHUB_WORKSPACE}"
npm run build
node build/src/action.js
