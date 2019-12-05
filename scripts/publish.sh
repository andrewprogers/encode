#! /usr/bin/env zsh

zsh scripts/clean_dist.sh

webpack --mode production

cd dist
touch .nojekyll
git add .
git commit -m 'publish demo site' &&
git push -u origin master --force