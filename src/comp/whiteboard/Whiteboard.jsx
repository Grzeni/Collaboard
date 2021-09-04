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



    //   let canvas = document.getElementById('main_canvas');
    //   let context = canvas.getContext('2d');
    //   for (const elem of data) {
    //     let [col, eSi, pSi, eSel] = elem.additionalData;
    //     context.lineCap = 'round';
    //     context.lineJoin = 'round';
    //     context.strokeStyle = eSel ? "white" : col;
    //     context.lineWidth = eSel ? eSi : pSi;
    //     context.beginPath();
    //     let first = true;
    //     for (const d of elem.pixelArray) {
    //       let [x, y] = d;
    //       if (first) {
    //         context.moveTo(x, y);
    //         first = false;
    //       }
    //       else {
    //         context.lineTo(x, y);
    //       }
    //       context.stroke();
    //     }
    //     context.closePath();
    //     this.setState({ drawing_counter: this.state.drawing_counter + 1 });
    //   }
    // }.bind(this));
  }

  componentDidMount() {
    console.log(this.state.eventList);
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
      for (const elem of sliced.filter(e => e.dataType === "drawing")) {
        elem.renderElement(canv);
      }
      this.setState({ eventList: sliced });
      this.setState({ drawing_counter: this.state.drawing_counter + 1 });
    }.bind(this));


    this.draw();
    // socket.on('connect-drawing-emition', function (globalEventData) {
    //   this.setState({eventList: globalEventData});
    //   console.log('drawing data is being received', globalEventData);
    //   let canv = document.getElementById('main_canvas');
    //   for (const drawing of globalEventData.fliter(e => e.getType() === "drawing")) {
    //     drawing.renderElement(canv);
    //   }
    // });
    socket.on('canvas-drawing-emit', function (globalEventList) {
      this.setState({ eventList: globalEventList.event_array });
      let canv = document.getElementById('main_canvas');
      console.log(globalEventList.event_array);
      let lastDrawing = (globalEventList[globalEventList.event_array.length - 1]);
      console.log(lastDrawing);
      let lD = new Drawing(lastDrawing.color, lastDrawing.penSize, lastDrawing.eraserSize, lastDrawing.isEraserSelected, lastDrawing.pixelArray);
      lD.renderElement(canv);
      // let canvas = document.getElementById('main_canvas');
      // let context = canvas.getContext('2d');
      // let [col, eSi, pSi, eSel] = data.additionalData;
      // context.lineCap = 'round';
      // context.lineJoin = 'round';
      // context.strokeStyle = eSel ? "white" : col;
      // context.lineWidth = eSel ? eSi : pSi;
      // context.beginPath();
      // let first = true;
      // for (const elem of data.pixelArray) {
      //   let [x, y] = elem;
      //   if (first) {
      //     context.moveTo(x, y);
      //     first = false;
      //   }
      //   else {
      //     context.lineTo(x, y);
      //   }
      //   context.stroke();
      // }
      // context.closePath();
      this.setState({ drawing_counter: this.state.drawing_counter + 1 });
    }.bind(this));
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
      context.fillStyle = 'white';
      context.fillRect(0, 0, canv.width, canv.height);
      for (const elem of eventArray.filter(e => e.dataType === "drawing")) {
        elem.renderElement(canv);
      }
    }.bind(this));
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
    // socket.on('undo-drawing-request-from-server', function(data) {
    //   console.log('undo data for drawing event has been received by client', data);
    // });
    // socket.on('redo-drawing-request-from-server', function(data) {
    //   console.log('redo data for drawing event has been received', data);
    // })
    // socket.on('undo-drawing-request-from-server', function (data) {
    //   let canvas = document.getElementById('main_canvas');
    //   let context = canvas.getContext('2d');
    //   canvas_context.fillStyle = 'white';
    //   canvas_context.fillRect(0, 0, canvas.width, canvas.height);
    //   for (const elem of data) {
    //     let [col, eSi, pSi, eSel] = elem.additionalData;
    //     context.lineCap = 'round';
    //     context.lineJoin = 'round';
    //     context.strokeStyle = eSel ? "white" : col;
    //     context.lineWidth = eSel ? eSi : pSi;
    //     context.beginPath();
    //     let first = true;
    //     for (const d of elem.pixelArray) {
    //       let [x, y] = d;
    //       if (first) {
    //         context.moveTo(x, y);
    //         first = false;
    //       }
    //       else {
    //         context.lineTo(x, y);
    //       }
    //       context.stroke();
    //     }
    //     context.closePath();
    //     this.setState({ drawing_counter: this.state.drawing_counter - 1 });
    //   }
    // }.bind(this));
  }

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
    console.log('ustawiona jest wartość e_select na:', this.state.e_select);
    console.log('ustawiona jest wartość color na:', this.state.color);
    console.log('ustawiona jest wartość p_size na:', this.state.p_size);
    console.log('ustawiona jest wartość e_size na:', this.state.e_size);
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