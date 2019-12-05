import React from 'react';
import sampleText from './misc_assets/melville_ch1.txt';


class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            input: sampleText
        }
    }
    render() {
        return(
        <p>{this.state.input}</p>
        )
    }
}

export default App;