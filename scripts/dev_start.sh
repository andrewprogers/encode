#! /usr/bin/env bash

watch_rust() {
    cd src/wasm
    cargo watch -s 'cargo check && wasm-pack build --out-dir ../wasm_pkg'
}

watch_rust() {
    cd src/wasm
    cargo watch -s 'cargo check && wasm-pack build --out-dir ../wasm_pkg'
}

zsh scripts/clean_dist.sh

webpack --mode development

watch_rust &
webpack-dev-server