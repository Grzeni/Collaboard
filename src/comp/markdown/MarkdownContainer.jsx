import React from 'react';
import './style.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Draggable from 'react-draggable';
import { socket } from '../../service/socket';

class MarkdownContainer extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            textId: this.props.txtId,
            textValue: this.props.txtVal,
            posiX: this.props.psX,
            posiY: this.props.psY,
        }
    }
    // componentWillReceiveProps(newProps) {
    //     this.setState({textId: newProps.txtId, textValue: newProps.txtVal})
    // }

    static getDerivedStateFromProps(newProps, prevState) {
        if (newProps.txtId !== prevState.textId || newProps.txtVal !== prevState.textValue) {
            return {textId: newProps.txtId, textValue: newProps.txtVal};
        } else if (newProps.psX !== prevState.posiX || newProps.psY !== prevState.posiY) {
            return {posiX: newProps.psX, posiY: newProps.psY}
        } else {
            return null;
        };
    }

    onDragStopFun(event, info) {
        console.log(info.node.id);
        //this.setState({posiX: info.x, posiY: info.y})
        //this.props.setLastPosition(info.x, info.y);
        let md = { id: info.node.id, xVal: info.x, yVal: info.y}; 
        socket.emit('text-moved', md);
    }


    render() {
        return (
        <Draggable position={{x: this.state.posiX, y: this.state.posiY}}
        onStop={this.onDragStopFun.bind(this)}><div id={this.state.textId} 
        onDoubleClick={this.props.interactFun}>
            <ReactMarkdown id={this.state.textId} remarkPlugins={[remarkGfm]} 
            children={this.state.textValue}></ReactMarkdown>
            </div></Draggable>
        );
    }
}

export default MarkdownContainer;