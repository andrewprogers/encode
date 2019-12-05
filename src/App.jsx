import React from 'react';
import sampleText from './misc_assets/melville_ch1.txt';
import {Container, Row, Col } from 'react-bootstrap';

import InputBox from './components/InputBox.jsx';


class App extends React.Component {
    constructor(props) {
        super(props);
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
                    </Col>
                    <Col></Col>
                </Row>
            </Container>
        )
    }
}

export default App;