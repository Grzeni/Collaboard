import React from 'react';
import './style.css';
import { socket } from '../../service/socket';
import Drawing from '../../data/Drawing';
import Markdown from '../../data/Markdown';



class Whiteboard extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      color: this.props.color,
      e_size: this.props.e_size,
      p_size: this.props.p_size,
      e_select: this.props.e_select,
      drawing_counter: 0,
      eventList: this.props.events
    }
  }

  componentDidMount() {
    console.log(this.state.eventList);
    //when a new user connects receive the event list from the server and process it
    socket.on('on-connect-emition', function (globalEventList) {
      console.log(globalEventList.event_array);
      let eventArray = globalEventList.event_array.map(e => {
        if (e.dataType === "text") {
          e = new Markdown(e.markdownId, e.markdownText, e.positionX, e.positionY);
        } else {
          e = new Drawing(e.color, e.penSize, e.eraserSize, e.isEraserSelected, e.pixelArray);
        }
        return e;
      });
      let sliced = eventArray.slice(0, globalEventList.pointer);
      let canv = document.getElementById('main_canvas');
      //render all the drawings that have been already drawn on the whiteboard before the user connected
      for (const elem of sliced.filter(e => e.dataType === "drawing")) {
        elem.renderElement(canv);
      }
      this.setState({ eventList: sliced });
      this.setState({ drawing_counter: this.state.drawing_counter + 1 });
    }.bind(this));

    //setup canvas settings and eventListeners for mouse-events
    this.draw();
    
    //receive the event list updated with one drawing from a user
    socket.on('canvas-drawing-emit', function (globalEventList) {
      this.setState({ eventList: globalEventList.event_array });
      let canv = document.getElementById('main_canvas');
      console.log(globalEventList.event_array);
      let filtered = globalEventList.event_array.filter(e => e.dataType === "drawing");
      let lastDrawing = (filtered[filtered.length - 1]);
      console.log(lastDrawing.length);
      console.log(lastDrawing);
      let lD = new Drawing(lastDrawing.color, lastDrawing.penSize, lastDrawing.eraserSize, lastDrawing.isEraserSelected, lastDrawing.pixelArray);
      //render that drawing
      lD.renderElement(canv);
      this.setState({ drawing_counter: this.state.drawing_counter + 1 });
    }.bind(this));

    //receive an undo request from the server
    socket.on('undo-request-from-server', function (globalEventList) {
      let sliced = globalEventList.event_array.slice(0, globalEventList.pointer);
      let eventArray = sliced.map(e => {
        if (e.dataType === "text") {
          e = new Markdown(e.markdownId, e.markdownText, e.positionX, e.positionY);
        } else {
          e = new Drawing(e.color, e.penSize, e.eraserSize, e.isEraserSelected, e.pixelArray);
        }
        return e;
      });
      this.setState({ eventList: eventArray });
      let canv = document.getElementById('main_canvas');
      let context = canv.getContext('2d');
      //clear the canvas
      context.fillStyle = 'white';
      context.fillRect(0, 0, canv.width, canv.height);
      //render only the drawings that happened until the last undid element
      for (const elem of eventArray.filter(e => e.dataType === "drawing")) {
        elem.renderElement(canv);
      }
    }.bind(this));

    //receive a redo request from the server
    socket.on('redo-request-from-server', function (globalEventList) {
      let sliced = globalEventList.event_array.slice(0, globalEventList.pointer);
      let eventArray = sliced.map(e => {
        if (e.dataType === "text") {
          e = new Markdown(e.markdownId, e.markdownText, e.positionX, e.positionY);
        } else {
          e = new Drawing(e.color, e.penSize, e.eraserSize, e.isEraserSelected, e.pixelArray);
        }
        return e;
      });
      this.setState({ eventList: eventArray });
      let canv = document.getElementById('main_canvas');
      let context = canv.getContext('2d');
      context.fillStyle = 'white';
      context.fillRect(0, 0, canv.width, canv.height);
      for (const elem of eventArray.filter(e => e.dataType === "drawing")) {
        elem.renderElement(canv);
      }
    }.bind(this));
  }

  //making sure that the state updates when properties change
  static getDerivedStateFromProps(newProps, prevState) {
    if (newProps.e_select !== prevState.e_select)
      return { e_select: newProps.e_select };
    if (newProps.color !== prevState.color)
      return { color: newProps.color };
    if (newProps.e_size !== prevState.e_size)
      return { e_size: newProps.e_size };
    if (newProps.p_size !== prevState.p_size)
      return { p_size: newProps.p_size };
    if (newProps.eventList !== prevState.eventList) {
      return { eventList: newProps.eventList };
    } else {
      return null;
    }
  }
  
  componentDidUpdate(prevProps, prevState) {
    if (this.props !== prevProps) {
      this.canvas_context.strokeStyle = this.state.e_select ? "white" : this.state.color;
      this.canvas_context.lineWidth = this.state.e_select ? this.state.e_size : this.state.p_size;
    }
    if (prevState.drawing_counter !== this.state.drawing_counter) {
      this.canvas_context.strokeStyle = this.state.e_select ? "white" : this.state.color;
      this.canvas_context.lineWidth = this.state.e_select ? this.state.e_size : this.state.p_size;
    }
  }


  draw() {
    var isDrawing = false;
    var drawing_data_array = [];
    let canvas = document.getElementById('main_canvas');
    let canvas_style = getComputedStyle(canvas);
    canvas.width = parseInt(canvas_style.getPropertyValue('width'));
    canvas.height = parseInt(canvas_style.getPropertyValue('height'));
    var root = this;

    this.canvas_context = canvas.getContext('2d');
    var canvas_context = this.canvas_context;
    canvas_context.lineCap = 'round';
    canvas_context.lineJoin = 'round';
    canvas_context.lineWidth = this.state.e_select ? this.state.e_size : this.state.p_size;
    canvas_context.strokeStyle = this.state.e_select ? "white" : this.state.color;
    canvas_context.fillStyle = 'white';
    //making sure that the canvas background is white so that when saving to a .png we don't get alpha channel background
    canvas_context.fillRect(0, 0, canvas.width, canvas.height);

    //on mousepress, we get the current coordinates of the pointer, initialize the drawing phase and move to where the pointer is
    canvas.addEventListener('mousedown', function (e) {
      var offsetX = e.pageX - canvas.offsetLeft;
      var offsetY = e.pageY - canvas.offsetTop;
      canvas_context.beginPath();
      canvas_context.moveTo(offsetX, offsetY);
      drawing_data_array.push([offsetX, offsetY]);
      isDrawing = true;
    });

    //when the mouse moves, we draw the actual line from where we started alongside the mousepath and fill it
    canvas.addEventListener('mousemove', function (e) {
      if (!isDrawing) return;
      var offsetX = e.pageX - canvas.offsetLeft;
      var offsetY = e.pageY - canvas.offsetTop;
      canvas_context.lineTo(offsetX, offsetY);
      //push the pixels we are drawing over to the array
      drawing_data_array.push([offsetX, offsetY]);
      canvas_context.stroke();

    });

    //when we release the mouse button we take our last drawing, save it to a png and emit it
    canvas.addEventListener('mouseup', function () {
      canvas_context.closePath();
      isDrawing = false;
      var last_drawn_thing = drawing_data_array;
      var eSel = root.state.e_select;
      var usedColor = root.state.color;
      var usedSize = root.state.p_size;
      var usedESize = root.state.e_size;
      //construct the drawing object and send it to the server
      var drawing_data = new Drawing(usedColor, usedSize, usedESize, eSel, last_drawn_thing);
      console.log(drawing_data);
      drawing_data_array = [];
      socket.emit('canvas-drawing', drawing_data);
      console.log('emitted drawing data to the server');
    });
  }

  render() {
    return (
      <>
        <canvas className='main_canvas' id='main_canvas'>
        </canvas>
      </>
    )
  }
}

export default Whiteboard