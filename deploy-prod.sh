#!/usr/bin/env bash

OLD_VERSION=1.3
NEW_VERSION=1.4

################################
#            CLIENT            #
################################

cd client || exit

read -rp "Deploy client? (Y/n) " deployClient
if [ "$deployClient" != 'n' ]; then
  yarn run build && \
  mv dist/browser/main.js dist/browser/main-$NEW_VERSION.js && \
  sed -i '' "s/src=\"main.js\"/src=\"main-$NEW_VERSION.js\"/"g dist/browser/index.html && \
  mv dist/browser/polyfills.js dist/browser/polyfills-$NEW_VERSION.js && \
  sed -i '' "s/src=\"polyfills.js\"/src=\"polyfills-$NEW_VERSION.js\"/"g dist/browser/index.html && \
  mv dist/browser/styles.css dist/browser/styles-$NEW_VERSION.css && \
  sed -i '' "s/href=\"styles.css\"/href=\"styles-$NEW_VERSION.css\"/"g dist/browser/index.html && \
  aws s3 sync ./dist/browser s3://osteopontault.fr/ && \
  aws s3 rm "s3://osteopontault.fr/main-$OLD_VERSION.js" && \
  aws s3 rm "s3://osteopontault.fr/polyfills-$OLD_VERSION.js" && \
  aws s3 rm "s3://osteopontault.fr/styles-$OLD_VERSION.css" && \
  aws cloudfront create-invalidation --no-cli-pager --distribution-id E1E3RY89L0RG0E --paths "/main-$NEW_VERSION.js" && \
  aws cloudfront create-invalidation --no-cli-pager --distribution-id E1E3RY89L0RG0E --paths "/polyfills-$NEW_VERSION.js" && \
  aws cloudfront create-invalidation --no-cli-pager --distribution-id E1E3RY89L0RG0E --paths "/styles-$NEW_VERSION.css"
  aws cloudfront create-invalidation --no-cli-pager --distribution-id E1E3RY89L0RG0E --paths "/index.html"
fi

read -rp "Deploy PWA? (y/N) " deployPWA
if [ "$deployPWA" == 'y' ]; then
  aws cloudfront create-invalidation --no-cli-pager --distribution-id E1E3RY89L0RG0E --paths "/manifest.json" && \
  aws cloudfront create-invalidation --no-cli-pager --distribution-id E1E3RY89L0RG0E --paths "/service-worker"
fi

cd ..


################################
#            SERVER            #
################################

cd server || exit

read -rp "Deploy lambdas? (Y/n) " deployLambda
if [ "$deployLambda" != 'n' ]; then
  npm run build && \
  sed -i '' 's/require("bcrypt-ts")/import("bcrypt-ts")/' dist/server/src/services/password.service.js && \
  sam deploy --s3-bucket osteopontault-lambda --config-file=./aws-samconfig.toml --template-file=./aws-template-prod.yaml
fi

read -rp "Deploy node modules? (y/N) " deployNodeModules
if [ "$deployNodeModules" == "y" ]; then
  mkdir nodejs && \
  cp package.json package-lock.json nodejs && \
  npm install --omit=dev --prefix nodejs && \
  zip -r nodejs.zip nodejs && \
#  If just publishing again node_modules on s3 doesn't work, uncomment below lines
#  aws lambda publish-layer-version \
#    --no-cli-pager
#    --layer-name osteopontault-server-node_modules \
#    --zip-file fileb://nodejs.zip \
#    --compatible-architectures x86_64 \
#    --compatible-runtimes nodejs20.x && \
  aws s3 cp ./nodejs.zip s3://osteopontault-lambda/nodejs.zip && \
  rm -rf nodejs && \
  rm -rf nodejs.zip
fi

read -rp "Play database migration? (y/N) " playDatabaseMigration
if [ "$playDatabaseMigration" == "y" ]; then
  apiEndpointUrl=$(aws cloudformation describe-stacks --stack-name osteopontault-server --query "Stacks[0].Outputs[?OutputKey=='WebEndpoint'].OutputValue" --output text)
  curl --request GET -sL --url "$apiEndpointUrl/script/database_migration"
fi

cd ..