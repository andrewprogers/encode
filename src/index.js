import ReactDOM from 'react-dom';
import React from 'react';

// required for react-bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';


class App extends React.Component {
    render() {
        return(<h1>Smoke test!</h1>)
    }
}

// must import web assembly code asynchronously
import('./wasm_pkg/encode_demo_wasm')
.then(wasm => {
    //wasm.greet("Andrew");
    let root = document.getElementById('react-root');
    console.log(root);
    ReactDOM.render(<App />, root);
})
