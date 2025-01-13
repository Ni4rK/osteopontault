#!/usr/bin/env bash

cd client && yarn run dev &
P1=$!

cd server && npm run watch &
P2=$!

DOCKER_HOST=unix://$HOME/.docker/run/docker.sock
cd server && DOCKER_HOST=$DOCKER_HOST sam local start-api --config-file=./aws-samconfig.toml --template-file=./aws-template-dev.yaml &
P3=$!

cd server && \
  sleep 3 && \
  sed -i '' 's/require("bcrypt-ts")/import("bcrypt-ts")/' dist/server/src/services/password.service.js

wait $P1 $P2 $P3
