import ReactDOM from 'react-dom';
import React from 'react';
import App from './App.jsx';

// required for react-bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';

// must import web assembly code asynchronously
import('./wasm_pkg/encode_demo_wasm')
.then(wasm => {
    let root = document.getElementById('react-root');

    ReactDOM.render(<App />, root);
})
