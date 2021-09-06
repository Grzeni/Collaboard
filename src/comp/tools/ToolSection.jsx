import React from 'react';
import './style.css';
import { MdFileDownload } from 'react-icons/md';
import { FaEraser, FaPencilAlt, FaUndo, FaRedo, FaUserFriends, FaFont } from 'react-icons/fa';


class ToolSection extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            color: props.color,
            p_size: props.p_size,
            e_size: props.e_size,
        }
    }


    render() {
        return (
            <div className='tools-section'>
                <span className='toolSelect-container'>
                    <span className='ctrl-z-ctrl-y-container'>
                        <button className='ctrl_z_btn' id='ctrl_z_btn' onClick={this.props.undoFun}><FaUndo></FaUndo>
                            <span className="tooltiptext">Undo</span>

                        </button>
                        <button className='ctrl_y_btn' id='ctrl_y_btn' onClick={this.props.redoFun}><FaRedo></FaRedo>
                            <span className="tooltiptext">Redo</span>
                        </button>
                    </span>
                    <span className='pencil_container'>
                        <button id='p_btn' className='p_btn' onClick={this.props.setPenSelected}><FaPencilAlt></FaPencilAlt>
                            <span className="tooltiptext">Pencil</span>
                        </button>
                        <select id='p_size_select' className='pSizeSelect' onChange={this.props.changePenSize}>
                            <option>5</option>
                            <option>10</option>
                            <option>15</option>
                            <option>20</option>
                        </select>
                    </span>
                    <span className='color-picker-container'>
                        <input className="colorPicker" type='color' id='p_color' onChange={this.props.changePenColor}>
                        </input>
                    </span>
                    <span className='eraser-container'>
                        <button id="e_btn" className='e_btn' onClick={this.props.setEraserSelected}><FaEraser></FaEraser>
                            <span className="tooltiptext">Eraser</span>
                        </button>
                        <select id='e_size_select' className='eSizeSelect' onChange={this.props.changeEraserSize}>
                            <option>5</option>
                            <option>10</option>
                            <option>15</option>
                            <option>20</option>
                            <option>30</option>
                            <option>50</option>
                            <option>75</option>
                            <option>100</option>
                        </select>
                    </span>
                </span>

                <span className='text-inuput-selection'>
                    <button id='select-text-input' className='markdownEditorBtn' onClick={this.props.textInputSelected}>
                        <FaFont></FaFont>
                        <span className="tooltiptext">Open text input</span>
                    </button>
                </span>
                <span className="collabContainer">
                    <button id='collabBtn' className='collabBtn' onClick={this.props.copyCollabLink}>
                        <FaUserFriends></FaUserFriends>
                        <span className="tooltiptext">Collaborate</span>
                    </button>
                </span>
                <span className='save-to-png'>
                    <button className='save_btn' id="save_btn" onClick={this.props.saveToPng}>
                        <MdFileDownload></MdFileDownload>
                        <span className="tooltiptext">Save whiteboard</span>
                    </button>
                </span>
            </div>
        );
    }
}
export default ToolSection;