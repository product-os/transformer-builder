#!/bin/bash
set -e

cd ${GITHUB_ACTION_PATH}
npm install
npm run build
node build/src/action.js
