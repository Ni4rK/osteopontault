#!/usr/bin/env bash

OLD_VERSION=1.2
NEW_VERSION=1.3

cd client && \
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
  aws cloudfront create-invalidation --distribution-id E1E3RY89L0RG0E --paths "/main-$NEW_VERSION.js" && \
  aws cloudfront create-invalidation --distribution-id E1E3RY89L0RG0E --paths "/polyfills-$NEW_VERSION.js" && \
  aws cloudfront create-invalidation --distribution-id E1E3RY89L0RG0E --paths "/styles-$NEW_VERSION.css"
  aws cloudfront create-invalidation --distribution-id E1E3RY89L0RG0E --paths "/index.html"
