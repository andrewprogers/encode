import React from 'react';

class CanvasWrapper extends React.Component {
    constructor(props) {
        super(props);
        this.canvasRef = React.createRef();
    }

    drawCanvas() {
        let canvas = this.canvasRef.current;
        let context = canvas.getContext('2d');
        let ratio = window.devicePixelRatio;

        context.setTransform(1, 0, 0, 1, 0, 0);
        context.fillStyle = '#FFF'
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.scale(ratio, ratio);

        this.props.draw(context);
    }

    initCanvas() {
        let canvas = this.canvasRef.current;
        let ratio = window.devicePixelRatio;
        canvas.width = this.props.width * ratio;
        canvas.height = this.props.height * ratio;
    }

    getMouseCoordinate(event) {
        let rect = this.canvasRef.current.getBoundingClientRect();
        let point = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        }
        return point;
    }

    componentDidMount() {
        this.initCanvas();
        this.drawCanvas();

        
        this.canvasRef.current.addEventListener('mousemove', e => {
            this.props.onMouseMove(this.getMouseCoordinate(e))
        })
        this.canvasRef.current.addEventListener('mouseover', e => {
            this.props.onMouseMove(this.getMouseCoordinate(e))
        })
        this.canvasRef.current.addEventListener('mouseout', e => {
            this.props.onMouseMove(null)
        })
    }

    componentDidUpdate() {
        this.initCanvas()
        this.drawCanvas();
    }

    render() {
        return(
            <canvas 
                ref={this.canvasRef} 
                style={{
                    width: `${this.props.width}px`,
                    height: `${this.props.height}px`,
                }}
            />
        )
    }
}

export default CanvasWrapper;