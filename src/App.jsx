import React from 'react';
import sampleText from './misc_assets/melville_ch1.txt';
import {Container, Row, Col } from 'react-bootstrap';

import InputBox from './components/InputBox.jsx';
import ByteVisualizer from './components/ByteVisualizer/ByteVisualizer';



class App extends React.Component {
    constructor(props) {
        super(props);
        this.encoder = new TextEncoder('utf-8');

        this.state = {
            input: sampleText
        }
        this.updateInput = this.updateInput.bind(this);
    }

    updateInput(newValue) {
        this.setState({
            input: newValue
        })
    }

    render() {
        return(
            <Container>
                <Row>
                    <Col></Col>
                    <Col xs={12} md={8}>
                        <InputBox value={this.state.input} onChange={this.updateInput}/>
                        <ByteVisualizer
                            bytes={this.encoder.encode(this.state.input)}
                            bitWidth={5}
                            bitHeight={20}
                            borderWidth={1}
                            maxHeight={200}
                        />
                    </Col>
                    <Col></Col>
                </Row>
            </Container>
        )
    }
}

export default App;

// changed anonymous func to class function
// .002 - .004 ms/byte
// only calculate masks once per run
// .001 - .0025 