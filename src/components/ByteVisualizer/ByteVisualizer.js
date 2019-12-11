import React from 'react';
import './ByteVisualizer.css';
import CanvasWrapper from './CanvasWrapper/CanvasWrapper';

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
            canvasScroll: 0,
            mouseOverByte: null
        }
        this.divRef = React.createRef();
        this.scrollerRef = React.createRef();
        this.setScrollTimeout = null;
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

    setScrollDebounced(scroll) {
        this.nextScroll = scroll;
        if (this.setScrollTimeout == null) {
            this.setScrollTimeout = window.setTimeout(() => {
                this.setScrollTimeout = null;
                this.setState({ canvasScroll: this.nextScroll })
            }, 50)
        }
    }

    componentDidMount() {
        this.setWidth();
        this.resizeListener = window.addEventListener('resize', () => {
            this.setWidth();
        });
        this.scrollListener = this.scrollerRef.current.addEventListener('scroll', (e) => this.setScrollDebounced(e.target.scrollTop) )
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resizeListener);
        this.scrollerRef.current.removeEventListener('scroll', this.scrollListener);
    }

    byteToCoordinate(byte) {
        let bytesPerRow = this.bytesPerRow();
        let row = Math.floor(byte / bytesPerRow);
        let col = byte - (row * bytesPerRow);
        return {
            x: col * this.byteWidth(),
            y: row * this.props.bitHeight - this.state.canvasScroll
        }
    }

    coordinateToByte({x, y}) {
        let rows = Math.floor((y + this.state.canvasScroll) / this.props.bitHeight);
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

    renderByte(ctx, byte, style) {
        let point = this.byteToCoordinate(byte);
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

    getVisibleByteRange() {
        let start = this.coordinateToByte({ x: 0, y: 0 });
        let end = this.props.bytes.length;
        if (this.props.maxHeight != null) {
            let y = this.props.maxHeight + this.props.bitHeight;
            end = this.coordinateToByte({ x: 0, y });
        }
        return { start, end }
    }

    renderBytes(ctx) {
        let window = this.getVisibleByteRange();

        for(var byte = window.start; byte < window.end; byte++) {
            this.renderByte(ctx, byte);
        }
    }

    renderHighlight(ctx) {
        let byte = this.state.mouseOverByte
        let point = this.byteToCoordinate(byte);
        if (byte < this.props.bytes.length) {
            ctx.clearRect(point.x, point.y, this.byteWidth(), this.props.bitHeight)
            this.renderByte(ctx, byte, this.highlightStyle)
        }
    }


    renderCanvas(ctx) {
        let start = Date.now()
        ctx.fillStyle = '#000';

        this.renderBytes(ctx);
        if (this.state.mouseOverByte != null) {
            this.renderHighlight(ctx)
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
            canvas = <CanvasWrapper 
                canvasScroll={this.state.canvasScroll}
                width={this.state.width}
                height={this.props.maxHeight} 
                draw={this.renderCanvas}
                borderWidth={this.props.borderWidth}
                setMousePosition={this.setMousePosition}
                />
        }

        return <div className="ByteVisualizer" ref={this.divRef}>
            <div 
                className="canvasBorder" 
                style={{ 
                    borderWidth: `${this.props.borderWidth}px`,
                    maxHeight: `${this.props.maxHeight + 2 * this.props.borderWidth}px`
                }}
                ref={this.scrollerRef}>
                {canvas}
                <div className="scrollSpacer" style={{ minHeight: `${this.getHeight()}px` }}></div>
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