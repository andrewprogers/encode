#! /usr/bin/env bash

webpack
cd dist
touch .nojekyll

git add .
git commit -m 'publish demo site' &&
git push -u origin master --force