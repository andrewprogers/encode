import React from 'react';
import './ScrollableCanvas.css';
import CanvasWrapper from './CanvasWrapper/CanvasWrapper';

class ScrollableCanvas extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            canvasScroll: 0
        }

        this.scrollerRef = React.createRef();
        this.scrollListener = null;
        this.setScrollTimeout = null;
        this.nextScroll = null;

        this.drawWindow = this.drawWindow.bind(this)
        this.handleMouseMove = this.handleMouseMove.bind(this)
    }

    setScrollDebounced(scroll) {
        this.nextScroll = scroll;
        if (this.setScrollTimeout == null) {
            this.setScrollTimeout = window.setTimeout(() => {
                this.setScrollTimeout = null;
                this.setState({ canvasScroll: this.nextScroll })
            }, 50)
        }
    }

    drawWindow(ctx) {
        this.props.drawWindow(ctx, this.state.canvasScroll);
    }

    handleMouseMove(canvasCoordinates) {
        canvasCoordinates.y += this.state.canvasScroll;
        this.props.onMouseMove(canvasCoordinates)
    }

    componentDidMount() {
        this.scrollListener = this.scrollerRef.current.addEventListener('scroll', (e) => this.setScrollDebounced(e.target.scrollTop) )
    }

    componentWillUnmount() {
        this.scrollerRef.current.removeEventListener('scroll', this.scrollListener);
    }

    render() {
        let style={
            maxHeight: `${this.props.height}px`
        };

        return <div className="ScrollableCanvas" style={style} ref={this.scrollerRef}>
            <div className="canvasWindow" style={{ top: `${this.state.canvasScroll}px` }}>
                <CanvasWrapper 
                    canvasScroll={this.state.canvasScroll}
                    width={this.props.width}
                    height={this.props.windowHeight} 
                    draw={this.drawWindow}
                    borderWidth={this.props.borderWidth}
                    onMouseMove={this.handleMouseMove}
                />
            </div>
            <div className="scrollSpacer" style={{ minHeight: `${this.props.scrollHeight}px` }}></div>
        </div>
    }
}

export default ScrollableCanvas;