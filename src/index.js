// must import web assembly code asynchronously
import('./wasm_pkg/encode_demo_wasm')
.then(wasm => {
    wasm.greet("Bob");
})
