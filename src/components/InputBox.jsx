import React from 'react';

const InputBox = ({id, value, onChange}) => {
    let changeHandler = event => {
        onChange(event.target.value)
    }

    return <div className="form-group shadow-textarea">
        <label htmlFor="exampleFormControlTextarea6">Text to Encode:</label>
        <textarea 
            className="form-control z-depth-1" 
            id={id}
            rows="5" 
            value={value}
            onChange={changeHandler}
            placeholder="Write something here..."></textarea>
    </div>
}

export default InputBox;