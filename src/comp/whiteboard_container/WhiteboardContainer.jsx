import React from 'react';
import Whiteboard from '../whiteboard/Whiteboard';
import MarkdownContainer from '../markdown/MarkdownContainer';
import './style.css'
import TextAreaContainer from '../text_editor/TextAreaContainer';
import ToolSection from '../tools/ToolSection';
import {socket} from '../../service/socket';


class WhiteboardContainer extends React.Component {
    constructor(props) {
        super(props);
        socket.on('connect-text-emition', function(data) {
            let f = data.map(elem => elem.flat());
            this.setState({text_received: f});  
            console.log('this  is text_add_data', this.state.text_add_data);
            console.log('this is text_received', this.state.text_received);
        }.bind(this));
        socket.on('text-addition-emit', function(data) {
            console.log('we are receiving our map back from the server', data);
            let flattened = data.map(elem => elem.flat());
            console.log('flattened data', flattened);
            this.setState({text_received: flattened}, () => console.log(this.state.text_received));
        }.bind(this));
        
        //jeśli chodzi o ctrl-z ctrl-y to spróbować listę cykliczną zrobić i nadpisywać w pewnym momencie

        //jeśli chodzi o kolaborację z innymi użytkownikami - najlepiej będzie zrobić jakiś niby hash, dołączyć go do adresu 
        //i taki adres będzie można przesyłac użytkownikowi + ewentualną autentykację z gmaila

        //przyjrzeć się deployowaniu takiej aplikacji
        this.state = {
            eraser_selected: false,
            color: "black",
            p_size: "5",
            e_size: "5",
            text_input_selected: false,
            text_add_data: [],
            last_selected_md_id: null,
            text_received: [],
            last_deleted_md_id: null,
            drawing_data: []
        }
    }

    componentDidMount() {
        this.setState({text_add_data: this.state.text_add_data});
        socket.on('undo-text-request-from-server', function(data) {
            console.log('data needed to undo text has been received by client', data);
        });
        socket.on('redo-text-request-from-server', function(data) {
            console.log('data needed to redo text evetn has been received by client', data);
        });
        // socket.on('undo-text-request-from-server', function(data) {
        //     this.setState({text_received: data});
        //     //albo text_add_data zmienić, nie jestem pewny
        // }.bind(this));  
        
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.text_add_data !== this.state.text_add_data) {
            socket.emit('text-addition', this.state.text_add_data);
            console.log('text_add_data has been updated and now we are sending it to the server', this.state.text_add_data);
            
        }
        if (prevState.last_deleted_md_id !== this.state.last_deleted_md_id) {
            socket.emit('delete-md-event', this.state.last_deleted_md_id);
            this.setState({last_deleted_md_id: this.last_deleted_md_id});
        }
        if (prevState.text_received !== this.state.text_received) {
            this.setState({text_received: this.state.text_received});
        }
    }

    //methods to handle tools

    changePenColor(params) {
        this.setState({color: params.target.value});
    }

    changePenSize(params) {
        console.log(params);
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

    saveToPng() {
        let downloadLink = document.createElement('a');
        downloadLink.setAttribute('download', 'whiteboard drawing.png');
        let can = document.getElementById('main_canvas');
        let dataURL = can.toDataURL('image/png');
        let url = dataURL.replace(/^data:image\/png/,'data:application/octet-stream');
	    downloadLink.setAttribute('href',url);
	    downloadLink.click();
    }

    undo() {
        console.log('undo function ran');
        socket.emit('undo-request');
    }

    redo() {
        console.log('redo function ran');
        socket.emit('redo-request');
    }

    //methods to handle text editor

    textInputSelected() {
        //1. otworzyć okno do wpisywania tekstu
        //2. po wpisaniu tekstu i kliknięciu przyciku add utowrzyć diva w lewym górnym rogu ekranu, który wyrenderuje do md tekst wpiswany w polu
        //3. div musi być przesuwalny ale skalować ma się tylko względem tego ile jest w nim tekstu i jakiej jest on wielkości
        //4. po dwukrotnym kliknięciu na div'a jego zawartość powinna wyświetlić się w 
        this.setState({text_input_selected: true});
        document.getElementById('edit_md').style = "visibility: hidden";
        document.getElementById('delete_md').style = "visibility: hidden";
        document.getElementById('actual_text_area').value = "";
        var t_a_container = document.getElementById('text_area_container');
        t_a_container.style.width = "500px";
        document.getElementById('main_canvas').style.marginLeft = "500px";
    }

    closeTextArea() {
        this.setState({text_input_selected: true});
        var t_a_container = document.getElementById('text_area_container');
        t_a_container.style.width = "0px";
        document.getElementById('main_canvas').style.marginLeft = "0px";
    }
    
    //methods to handle markdown text rendering

    addMarkdownDiv() {
        var t_a = document.getElementById('actual_text_area');
        this.setState({text_add_data: [...this.state.text_add_data, [Date.now(), t_a.value, {pX: 641, pY: 210}]]}, () => console.log(this.state.text_add_data));
    }

    interactWithHoverText(t) {
        let t_a = document.getElementById("actual_text_area");
        let currentMd = this.state.text_received.find(x => x[0].toString() === t);
        t_a.value = currentMd[1];
        let edit_btn = document.getElementById('edit_md');
        edit_btn.style = "visibility: visible";
        let del_btn = document.getElementById('delete_md');
        del_btn.style = "visibility: visible";
        let t_a_container = document.getElementById('text_area_container');
        t_a_container.style.width = "500px";
        document.getElementById('main_canvas').style.marginLeft = "500px";
        this.setState({last_selected_md_id: t}, () => console.log(this.state.last_selected_md_id)); 
    }

    editMd() {
        var t_id = this.state.last_selected_md_id;
        let a_ta = document.getElementById('actual_text_area');
        let curr_val = a_ta.value;
        let text_data_copy = this.state.text_received;
        let prev_value_entry = text_data_copy.find(elem => elem[0].toString() === t_id);
        let new_entry = [prev_value_entry[0], curr_val, prev_value_entry[2]] 
        let new_list = text_data_copy.map((elem) => {
            if (elem === prev_value_entry) {
                elem = new_entry;
            }
            return elem;
        });
        this.setState({text_add_data: new_list}, function() {
            console.log(this.state.text_add_data);
        });
        let t_a_container = document.getElementById('text_area_container');
        t_a_container.style.width = "0px";
        document.getElementById('main_canvas').style.marginLeft = "0px";
    }

    deleteMd() {
        console.log("delete md ran");
        let last_md = this.state.last_selected_md_id;
        console.log("this is the id of the last selected md", last_md);
        let text_data_copy = this.state.text_received;
        console.log("this is the text_eceived copy", text_data_copy);
        let new_list = text_data_copy.filter(elem => elem[0].toString() !== last_md);
        console.log("this is the new list without the deleted element", new_list);
        this.setState({text_add_data: new_list});
        this.setState({last_deleted_md_id: last_md});
    }

    setPosition(i, x, y) {
        console.log('set position ran');
        let l = this.state.text_received;
        let f = l.find(elem => elem[0].toString() === i);
        let newList = l.map((elem) => {
            if (elem === f) {
                elem[2] = {pX: x, pY: y};
            }
            return elem;});
        this.setState({text_add_data: newList}, function() {
            console.log(this.state.text_add_data);
        });
    }
    

    render() {
        return (
            <div className='container'>
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
                    redoFun={this.redo.bind(this)}>
                </ToolSection>
                
                <div id='whiteboard_container' className='whiteboard-container'>
                    {
                        this.state.text_received.map(elem => 
                            <div className='markdown-div' key={elem[0]}><MarkdownContainer txtId={elem[0]} txtVal={elem[1]} 
                            setLastPosition={this.setPosition.bind(this)}
                            psX={elem[2].pX}
                            psY={elem[2].pY}
                            interactFun={this.interactWithHoverText.bind(this, elem[0])}>
                                </MarkdownContainer></div>)
                    }  
                    <TextAreaContainer addMD={this.addMarkdownDiv.bind(this)}
                                    editMD={this.editMd.bind(this)}
                                    deleteMD={this.deleteMd.bind(this)}
                                    closeTextEditor={this.closeTextArea.bind(this)}>    
                    </TextAreaContainer>
                    
                    <Whiteboard draw_data={this.state.drawing_data} 
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