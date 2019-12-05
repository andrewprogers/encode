#! /usr/bin/env bash

watch_rust() {
    cd src/wasm
    cargo watch -s 'cargo check && wasm-pack build --out-dir ../wasm_pkg'
}

watch_rust() {
    cd src/wasm
    cargo watch -s 'cargo check && wasm-pack build --out-dir ../wasm_pkg'
}

rm -f dist/*.html
rm -f dist/*.wasm
rm -f dist/*.js
webpack
watch_rust &
webpack-dev-server