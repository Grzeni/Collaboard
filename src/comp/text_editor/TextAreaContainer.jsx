import React from 'react';
import './style.css';

class TextAreaContainer extends React.Component {
    render() {
        return (
            <div id='text_area_container' className='text-area-container'>
                <button id='add_md' className='add-md' onClick={this.props.addMD}>Add</button>
                <button id='edit_md' className='edit-md' onClick={this.props.editMD}>Edit</button>
                <button id='delete_md' className='delete-md' onClick={this.props.deleteMD}>Delete</button>
                <button id='closebtn' className='closebtn' onClick={this.props.closeTextEditor}>X</button>
                <select name="fontSelect" id="fontSelect" onChange={this.props.selectFont}>
                    <option>5</option>
                    <option>10</option>
                    <option>15</option>
                    <option>20</option>
                    <option>25</option>
                    <option>30</option>
                </select>
                <textarea id='actual_text_area' className='actual-text-area' rows='40' cols='57'></textarea>
            </div>
        );
    }

}

export default TextAreaContainer;