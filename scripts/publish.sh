#! /usr/bin/env bash

rm -f dist/*.html
rm -f dist/*.wasm
rm -f dist/*.js

webpack
cd dist
touch .nojekyll

git add .
git commit -m 'publish demo site' &&
git push -u origin master --force