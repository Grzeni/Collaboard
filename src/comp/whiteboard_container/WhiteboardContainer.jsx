import React, { useState } from 'react';
import {MdFileDownload, MdKeyboardArrowLeft, MdKeyboardArrowRight, MdEdit, MdFormatColorText, MdFormatPaint} from 'react-icons/md';
import {FaArrowAltCircleLeft, FaArrowAltCircleRight, FaEraser, FaPencilAlt, FaFont} from 'react-icons/fa';
import Whiteboard from '../whiteboard/Whiteboard';
import './style.css'

class WhiteboardContainer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            eraser_selected: false,
            color: "black",
            p_size: "5",
            e_size: "5",
            text_input_on: false
        }
    }

    changePenColor(params) {
        this.setState({color: params.target.value});
    }

    changePenSize(params) {
        this.setState({p_size: params.target.value});
    }

    setPenSelected() {
        this.setState({eraser_selected: false});
        var p = document.getElementById('p_btn');
        var e = document.getElementById('e_btn');
        p.style.borderColor = "black";
        e.style.border = "";
    }

    setEraserSelected() {
        this.setState({eraser_selected: true});
        var e = document.getElementById('e_btn');
        var p = document.getElementById('p_btn');
        e.style.borderColor = 'black';
        p.style.border = "";
        
    }

    changeEraserSize(params) {
        this.setState({e_size: params.target.value});
    }

    selectTextInput() {
        this.setState({text_input_on: true});
    }


    //function to handle saving the current canvas to a .png file and downloading it
    saveToPng() {
        let downloadLink = document.createElement('a');
        downloadLink.setAttribute('download', 'whiteboard drawing.png');
        let can = document.getElementById('main_canvas');
        let dataURL = can.toDataURL('image/png');
        let url = dataURL.replace(/^data:image\/png/,'data:application/octet-stream');
	    downloadLink.setAttribute('href',url);
	    downloadLink.click();
    }


    render() {
        return (
            <div className='container'>
                <div class='tools-section'>
                    <span className='toolSelect-container'>
                        <span className='ctrl-z-ctrl-y-container'>
                            <button className='ctrl_z_btn' id='ctrl_z_btn'><FaArrowAltCircleLeft></FaArrowAltCircleLeft></button>
                            <button className='ctrl_y_btn' id='ctrl_y_btn'><FaArrowAltCircleRight></FaArrowAltCircleRight></button>
                        </span>
                        <span className='pencil_container'>
                            <button id='p_btn' className='p_btn' onClick={this.setPenSelected.bind(this)}><FaPencilAlt></FaPencilAlt></button>
                            <select id='p_size_select' defaultValue='5' value={this.state.p_size} onChange={this.changePenSize.bind(this)}>
                                <option>5</option>
                                <option>10</option>
                                <option>15</option>
                                <option>20</option>
                            </select>
                        </span>
                        
                        <span className='eraser-container'>
                            <button id="e_btn" className='e_btn' onClick={this.setEraserSelected.bind(this)}><FaEraser></FaEraser></button>
                            <select id='e_size_select' defaultValue='5' value={this.state.e_size} onChange={this.changeEraserSize.bind(this)}>
                                <option>5</option>
                                <option>10</option>
                                <option>15</option>
                                <option>20</option>
                            </select> 
                        </span>
                    </span>
                    <span className='color-picker-conrainer'>
                        <MdFormatPaint></MdFormatPaint>: &nbsp;
                        <input type='color' id='p_color' defaultValue='black' value={this.state.color} onChange={this.changePenColor.bind(this)}></input>
                    </span>
                    <span className='save-to-png'>
                        <button className='save_btn' id="save_btn" onClick={this.saveToPng.bind(this)}>
                            <MdFileDownload></MdFileDownload>
                        </button>
                    </span>
                    <span className='text-inuput-selection'>
                        <button id='select-text-input' onClick={this.selectTextInput.bind(this)}>
                            <FaFont></FaFont>
                        </button>
                    </span>
                    <div className='people-online-list-dropdown'>
                        <button className='dropdown-list-btn'>1 online</button>
                        <div className='people-list-dropdown'>
                            <a href='#'> Someone </a>
                            <a href='#'> Soemone </a>
                        </div>
                    </div>
                </div>
                
                <div id='whiteboard_container' class='whiteboard-container'>
                    <Whiteboard color={this.state.color} p_size={this.state.p_size} e_size={this.state.e_size} e_select={this.state.eraser_selected} text_selected={this.state.text_input_on}></Whiteboard>
                </div>
            </div>  
        )
    }
}
export default WhiteboardContainer