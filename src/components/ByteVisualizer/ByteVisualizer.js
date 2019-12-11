import React from 'react';
import './ByteVisualizer.css';
import ScrollableCanvas from './ScrollableCanvas/ScrollableCanvas'

class ByteVisualizer extends React.Component {
    constructor(props) {
        super(props);

        this.masks = setBitMasks();
        this.highlightStyle = {
            high: 'rgb(200, 200, 0)',
            low: 'rgb(255, 255, 200)'
        }

        this.state = {
            width: 0,
            mouseOverByte: null
        }
        this.divRef = React.createRef();
        this.renderCanvas = this.renderCanvas.bind(this);
        this.setMousePosition = this.setMousePosition.bind(this);
    }

    bytesPerRow(w) { 
        let width = (w !== undefined ) ? w : this.state.width;
        return Math.floor(width / this.byteWidth()) 
    }
    byteWidth() { return this.props.bitWidth * 8; }

    setWidth() {
        let div = this.divRef.current;
        let width = div.clientWidth; //Assumes no border on this div
        let numBytes = this.bytesPerRow(width);
        let adjustedWidth = (numBytes * this.byteWidth());

        this.setState({ width: adjustedWidth })
    }

    setMousePosition(canvasCoord) {
        let byte = (canvasCoord != null) ? this.coordinateToByte(canvasCoord) : null;

        if (this.state.mouseOverByte != byte) {
            this.setState({ mouseOverByte: byte })
        }
    }

    componentDidMount() {
        this.setWidth();
        this.resizeListener = window.addEventListener('resize', () => {
            this.setWidth();
        });
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resizeListener);
    }

    byteToCoordinate(byte) {
        let bytesPerRow = this.bytesPerRow();
        let row = Math.floor(byte / bytesPerRow);
        let col = byte - (row * bytesPerRow);
        return {
            x: col * this.byteWidth(),
            y: row * this.props.bitHeight
        }
    }

    coordinateToByte({x, y}) {
        let rows = Math.floor(y / this.props.bitHeight);
        let cols = Math.floor(x / this.byteWidth());
        return cols + rows * this.bytesPerRow();
    }

    renderBitStyled(ctx, high, x, y, style) {
        ctx.save();
        ctx.fillStyle = high ? style.high : style.low;
        ctx.fillRect(x, y, this.props.bitWidth, this.props.bitHeight);
        ctx.restore()
    }

    renderBit(ctx, high, x, y) {
        if (high) {
            ctx.fillRect(x, y, this.props.bitWidth, this.props.bitHeight);
        }
    }

    renderByte(ctx, yOffset, byte, style) {
        let point = this.byteToCoordinate(byte);
        point.y -= yOffset;
        let xOffset = 0;

        for(var bit = 8; bit > 0; bit--) {
            let high = ((this.props.bytes[byte] & this.masks[bit - 1]) != 0);
            if (style != null) {
                this.renderBitStyled(ctx, high, point.x + xOffset, point.y, style);
            } else {
                this.renderBit(ctx, high, point.x + xOffset, point.y);
            }

            xOffset += this.props.bitWidth;
        }
    }

    getVisibleByteRange(yOffset) {
        let start = this.coordinateToByte({ x: 0, y: yOffset });
        let end = this.props.bytes.length;
        if (this.props.maxHeight != null) {
            let y = yOffset + this.props.maxHeight + this.props.bitHeight;
            end = this.coordinateToByte({ x: 0, y });
        }
        return { start, end }
    }

    renderBytes(ctx, yOffset) {
        let window = this.getVisibleByteRange(yOffset);

        for(var byte = window.start; byte < window.end; byte++) {
            this.renderByte(ctx, yOffset, byte);
        }
    }

    renderHighlight(ctx, yOffset) {
        let byte = this.state.mouseOverByte
        let point = this.byteToCoordinate(byte);
        point.y -= yOffset;

        if (byte < this.props.bytes.length) {
            ctx.clearRect(point.x, point.y, this.byteWidth(), this.props.bitHeight)
            this.renderByte(ctx, yOffset, byte, this.highlightStyle)
        }
    }


    renderCanvas(ctx, yOffset) {
        let start = Date.now()
        ctx.fillStyle = '#000';

        this.renderBytes(ctx, yOffset);
        if (this.state.mouseOverByte != null) {
            this.renderHighlight(ctx, yOffset);
        }
        let elapsed = Date.now() - start;
        console.log(`Rendered in ${elapsed}ms`)
    }

    getHeight() {
        let numBytes = this.props.bytes.length;
        let rows = Math.ceil(numBytes / this.bytesPerRow());
        if (rows == 0) { rows = 1; } 
        return rows * this.props.bitHeight;
    }

    render() {
        let canvas = null;
        if (this.state.width !== 0) {
            canvas = <ScrollableCanvas
                width={this.state.width}
                windowHeight={this.props.maxHeight}
                scrollHeight={this.getHeight()}
                drawWindow={this.renderCanvas}
                onMouseMove={this.setMousePosition}
            />
        }

        let borderStyle = { 
            borderWidth: `${this.props.borderWidth}px`,
            maxHeight: `${this.props.maxHeight + 2 * this.props.borderWidth}px`
        };

        return <div className="ByteVisualizer" ref={this.divRef}>
            <div className="canvasBorder" style={borderStyle}>
                {canvas}
            </div>
        </div>
    }
}

function setBitMasks() {
    let masks = [];
    let next = 1;
    while (masks.length < 8)
    {
        masks.push(next);
        next = next * 2;
    }
    return masks;
}

export default ByteVisualizer;