import React from 'react';
import Whiteboard from '../whiteboard/Whiteboard';
import MarkdownContainer from '../markdown/MarkdownContainer';
import './style.css'
import TextAreaContainer from '../text_editor/TextAreaContainer';
import ToolSection from '../tools/ToolSection';
import { socket } from '../../service/socket';
import Markdown from '../../data/Markdown';
import Drawing from '../../data/Drawing';
import queryString from 'query-string';
import * as htmlToImage from 'html-to-image';

class WhiteboardContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            eraser_selected: false,
            color: "black",
            p_size: "5",
            e_size: "5",
            text_input_selected: false,
            text_add_data: [],
            lastSelectedMd: null,
            textEventList: [],
            eventList: [],
            last_deleted_md_id: null,
            drawing_data: [],
            lastMoved: null,
        }
        //get the address bar parameters and send them to the server, check for errors
        const { room, username} = queryString.parse(window.location.search);
        console.log(room, username);
        console.log('app version:', "170920211314");
        socket.emit('new-user-connected', { username, room }, error => {
            if (error) {
                alert(error);
            }
        });

    }

    componentDidMount() {
        //when a new user connects receive the event list from server and update the state based on it
        socket.on('on-connect-emition', function (globalEventList) {
            console.log('received global event list from the server', globalEventList);
            let sliced = globalEventList.event_array.slice(0, globalEventList.pointer);
            let eventArray = sliced.map(e => {
                if (e.dataType === "text") {
                    e = new Markdown(e.markdownId, e.markdownText, e.positionX, e.positionY, e.isDeleted);
                } else {
                    e = new Drawing(e.color, e.penSize, e.eraserSize, e.isEraserSelected, e.pixelArray);
                }
                return e;
            });
            let filterByText = eventArray.filter(e => e.dataType === "text");
            console.log("this is the event array filtered for only text", filterByText);
            let hashSet = new Map();
            console.log('hashset before procedure', hashSet);
            for (let i = filterByText.length - 1; i >= 0; i--) {
                let id = filterByText[i].markdownId;
                if (hashSet.get(id) === undefined) {
                    console.log(filterByText[i].isDeleted);
                    if (filterByText[i].isDeleted === true) {
                        console.log('this shit actually ran');
                        hashSet.set(id, null);
                    } else {
                        hashSet.set(id, filterByText[i]);
                    }
                }
            }
            console.log('hashset after procedure', hashSet);
            let eventListToRender = Array.from(hashSet).map(arr => arr[1]).filter(arr => arr !== null);
            console.log('eventList after flattening and null verification', eventListToRender);
            this.setState({ eventList: eventListToRender });

            // this.setState({ eventList: sliced }, () => console.log(this.state.eventList));
        }.bind(this));
        //whenever a user does any sort of text operation receive the updated event list from server and update state
        socket.on('text-addition-emit', function (globalEventList) {
            console.log('we are receiving the globalEventList back from the server', globalEventList);
            let eventArray = globalEventList.event_array.map(e => {
                if (e.dataType === "text") {
                    e = new Markdown(e.markdownId, e.markdownText, e.positionX, e.positionY, e.isDeleted);
                } else {
                    e = new Drawing(e.color, e.penSize, e.eraserSize, e.isEraserSelected, e.pixelArray);
                }
                return e;
            });

            let filterByText = eventArray.filter(e => e.dataType === "text");
            console.log("this is the event array filtered for only text", filterByText);
            let hashSet = new Map();
            console.log('hashset before procedure', hashSet);
            for (let i = filterByText.length - 1; i >= 0; i--) {
                let id = filterByText[i].markdownId;
                if (hashSet.get(id) === undefined) {
                    console.log(filterByText[i].isDeleted);
                    if (filterByText[i].isDeleted === true) {
                        console.log('this shit actually ran');
                        hashSet.set(id, null);
                    } else {
                        hashSet.set(id, filterByText[i]);
                    }
                }
            }
            console.log('hashset after procedure', hashSet);
            let eventListToRender = Array.from(hashSet).map(arr => arr[1]).filter(arr => arr !== null);
            console.log('eventList after flattening and null verification', eventListToRender);
            this.setState({ eventList: eventListToRender });
        }.bind(this));
        //handle undo request similarily to a normal text operation but slice the event list at the pointer value first
        socket.on('undo-request-from-server', function (globalEventList) {
            let sliced = globalEventList.event_array.slice(0, globalEventList.pointer);
            let eventArray = sliced.map(e => {
                if (e.dataType === "text") {
                    e = new Markdown(e.markdownId, e.markdownText, e.positionX, e.positionY, e.isEdited, e.isDeleted, e.isMoved);
                } else {
                    e = new Drawing(e.color, e.penSize, e.eraserSize, e.isEraserSelected, e.pixelArray);
                }
                return e;
            });
            let filterByText = eventArray.filter(e => e.dataType === "text");
            let hashSet = new Map();
            console.log('hashset before procedure', hashSet);
            for (let i = filterByText.length - 1; i >= 0; i--) {
                let id = filterByText[i].markdownId;
                if (hashSet.get(id) === undefined) {
                    console.log(filterByText[i].isDeleted);
                    if (filterByText[i].isDeleted === true) {
                        console.log('this shit actually ran');
                        hashSet.set(id, null);
                    } else {
                        hashSet.set(id, filterByText[i]);
                    }
                }
            }
            let eventListToRender = Array.from(hashSet).map(arr => arr[1]).filter(arr => arr !== null);
            this.setState({ eventList:  eventListToRender }, () => console.log(this.state.eventList));
        }.bind(this));
        //handle redo request similarily to undo
        socket.on('redo-request-from-server', function (globalEventList) {
            let sliced = globalEventList.event_array.slice(0, globalEventList.pointer);
            let eventArray = sliced.map(e => {
                if (e.dataType === "text") {
                    e = new Markdown(e.markdownId, e.markdownText, e.positionX, e.positionY, e.isDeleted);
                } else {
                    e = new Drawing(e.color, e.penSize, e.eraserSize, e.isEraserSelected, e.pixelArray);
                }
                return e;
            });
            let filterByText = eventArray.filter(e => e.dataType === "text");
            let hashSet = new Map();
            console.log('hashset before procedure', hashSet);
            for (let i = filterByText.length - 1; i >= 0; i--) {
                let id = filterByText[i].markdownId;
                if (hashSet.get(id) === undefined) {
                    console.log(filterByText[i].isDeleted);
                    if (filterByText[i].isDeleted === true) {
                        console.log('this shit actually ran');
                        hashSet.set(id, null);
                    } else {
                        hashSet.set(id, filterByText[i]);
                    }
                }
            }
            let eventListToRender = Array.from(hashSet).map(arr => arr[1]).filter(arr => arr !== null);
            this.setState({ eventList: eventListToRender }, () => console.log(this.state.eventList));
        }.bind(this));
    }

    //methods to handle tools

    changePenColor(params) {
        this.setState({ color: params.target.value });
    }

    changePenSize(params) {
        console.log(params);
        this.setState({ p_size: params.target.value });
    }

    setPenSelected() {
        this.setState({ eraser_selected: false });
        var p = document.getElementById('p_btn');
        var e = document.getElementById('e_btn');
        p.style.borderColor = "black";
        e.style.border = "";
    }

    setEraserSelected() {
        this.setState({ eraser_selected: true });
        var e = document.getElementById('e_btn');
        var p = document.getElementById('p_btn');
        e.style.borderColor = 'black';
        p.style.border = "";
    }

    changeEraserSize(params) {
        this.setState({ e_size: params.target.value });
    }

    saveToPng() {
        htmlToImage.toPng(document.getElementById('whiteboard_container'))
        .then( function(dataUrl) {
            let downloadLink = document.createElement('a');
            downloadLink.setAttribute('download', 'whiteboard drawing.png');
            let url = dataUrl.replace(/^data:image\/png/, 'data:application/octet-stream');
            downloadLink.setAttribute('href', url);
            downloadLink.click();
        });
        
    }

    copyInvite() {
        let { room , }  = queryString.parse(window.location.search);
        let link = `https://quizzical-borg-ced3aa.netlify.app/invite?room=${room}`;
        let p = navigator.clipboard.writeText(link);
        p.then(function() {
            //here we could fire off sth that makes it known that the thing has been copied
            console.log('link copied to clipboard');
        }, function() {
            alert('clipboard write failuer');
        });
    }

    undo() {
        console.log('undo function ran');
        socket.emit('undo-request');
    }

    redo() {
        console.log('redo function ran');
        socket.emit('redo-request');
    }

    //methods to handle text field

    textInputSelected() {
        this.setState({ text_input_selected: true });
        document.getElementById('edit_md').style = "visibility: hidden";
        document.getElementById('delete_md').style = "visibility: hidden";
        document.getElementById('actual_text_area').value = "";
        var t_a_container = document.getElementById('text_area_container');
        t_a_container.style.width = "500px";
        document.getElementById('main_canvas').style.marginLeft = "500px";
    }

    closeTextArea() {
        this.setState({ text_input_selected: false });
        var t_a_container = document.getElementById('text_area_container');
        t_a_container.style.width = "0px";
        document.getElementById('main_canvas').style.marginLeft = "0px";
    }

    //methods to handle markdown text manipulation

    addMarkdownDiv() {
        var t_a = document.getElementById('actual_text_area');
        socket.emit('text-addition', new Markdown(Date.now(), t_a.value, 641, 210));
    }

    interactWithHoverText(t) {
        let t_a = document.getElementById("actual_text_area");
        let currentMd = this.state.eventList.filter(e => e.dataType === "text").filter(e => e.isEdited !== true).find(e => e.markdownId === t);
        //let cmd = new Markdown(currentMd.markdownId, currentMd.markdownText, currentMd.positionX, currentMd.positionY);
        t_a.value = currentMd.markdownText;
        let edit_btn = document.getElementById('edit_md');
        edit_btn.style = "visibility: visible";
        let del_btn = document.getElementById('delete_md');
        del_btn.style = "visibility: visible";
        let t_a_container = document.getElementById('text_area_container');
        t_a_container.style.width = "500px";
        document.getElementById('main_canvas').style.marginLeft = "500px";
        this.setState({ lastSelectedMd: currentMd }, () => console.log(this.state.lastSelectedMd));
    }

    editMd() {
        //odzyskaj ostatnio wybrany tekst
        var lastMd = this.state.lastSelectedMd;
        console.log(lastMd);
        let textArea = document.getElementById('actual_text_area');
        let currentTextAreaValue = textArea.value;
        //zmień jego wartość
        lastMd.markdownText = currentTextAreaValue;
        //wyemituj go na server
        socket.emit('text-edited', lastMd);
        //schowaj pole tekstowe
        let t_a_container = document.getElementById('text_area_container');
        t_a_container.style.width = "0px";
        document.getElementById('main_canvas').style.marginLeft = "0px";
    }

    deleteMd() {
        let lastMd = this.state.lastSelectedMd;
        lastMd.isDeleted = true;
        socket.emit('text-deleted', lastMd);
    }


    render() {
        return (
            <div id='wb_container' className='container'>
                <ToolSection color={this.state.color}
                    e_size={this.state.e_size}
                    p_size={this.state.p_size}
                    changePenColor={this.changePenColor.bind(this)}
                    changePenSize={this.changePenSize.bind(this)}
                    changeEraserSize={this.changeEraserSize.bind(this)}
                    textInputSelected={this.textInputSelected.bind(this)}
                    setEraserSelected={this.setEraserSelected.bind(this)}
                    setPenSelected={this.setPenSelected.bind(this)}
                    saveToPng={this.saveToPng.bind(this)}
                    undoFun={this.undo.bind(this)}
                    redoFun={this.redo.bind(this)}
                    copyInvite={this.copyInvite.bind(this)}>
                </ToolSection>

                <div id='whiteboard_container' className='whiteboard-container'>
                    {
                        this.state.eventList
                            .map(elem =>
                                <div className='markdown-div' key={elem.markdownId}>
                                    <MarkdownContainer txtId={elem.markdownId} txtVal={elem.markdownText}
                                        psX={elem.positionX}
                                        psY={elem.positionY}
                                        interactFun={this.interactWithHoverText.bind(this, elem.markdownId)}>
                                    </MarkdownContainer>
                                </div>)
                    }
                    <TextAreaContainer addMD={this.addMarkdownDiv.bind(this)}
                        editMD={this.editMd.bind(this)}
                        deleteMD={this.deleteMd.bind(this)}
                        closeTextEditor={this.closeTextArea.bind(this)}>
                    </TextAreaContainer>
                    <Whiteboard events={this.state.eventList}
                        color={this.state.color}
                        p_size={this.state.p_size}
                        e_size={this.state.e_size}
                        e_select={this.state.eraser_selected}
                        text_selected={this.state.text_input_detected}>
                    </Whiteboard>
                </div>
            </div>
        )
    }
}
export default WhiteboardContainer;