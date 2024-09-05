#!/usr/bin/env bash

cd server && \
  npm run build && \
  sed -i '' 's/require("bcrypt-ts")/import("bcrypt-ts")/' dist/server/src/services/password.service.js && \
#  mkdir nodejs && \
#  cp package.json package-lock.json nodejs && \
#  npm install --omit=dev --prefix nodejs && \
#  zip -r nodejs.zip nodejs && \
#  aws lambda publish-layer-version \
#    --layer-name osteopontault-server-node_modules \
#    --zip-file fileb://nodejs.zip \
#    --compatible-architectures x86_64 \
#    --compatible-runtimes nodejs20.x && \
#  aws s3 cp ./nodejs.zip s3://osteopontault-lambda/nodejs.zip && \
#  rm -rf nodejs && \
#  rm -rf nodejs.zip && \
  sam deploy --s3-bucket osteopontault-lambda --config-file=./aws-samconfig.toml --template-file=./aws-template-prod.yaml
