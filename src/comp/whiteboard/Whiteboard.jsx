import React from 'react';
import './style.css';
import io from 'socket.io-client';

class Whiteboard extends React.Component {
  
  socket = io.connect('http://localhost:3000');
  constructor(props) {
    super(props);
    //drawing the image that we receive
    this.socket.on('canvas-drawing', function(data) {
      var image = new Image();
      var rec_canvas = document.getElementById('main_canvas');
      var rec_canvas_context = rec_canvas.getContext('2d');
      image.onload = () => {
        rec_canvas_context.drawImage(image, 0, 0);
      };
      image.src = data;
      });
  }

  componentDidMount() {
    this.draw();
  }

  componentWillReceiveProps(newProps) {
    this.canvas_context.strokeStyle = newProps.e_select ? "white" : newProps.color;
    this.canvas_context.lineWidth = newProps.e_select ? newProps.e_size : newProps.p_size;
  }

  draw() {
    var isDrawing = false;
    let canvas = document.getElementById('main_canvas');
    let canvas_style = getComputedStyle(canvas);
    canvas.width = parseInt(canvas_style.getPropertyValue('width'));
    canvas.height = parseInt(canvas_style.getPropertyValue('height'));
    var root = this;
    

    this.canvas_context = canvas.getContext('2d');
    var canvas_context = this.canvas_context;
    canvas_context.lineCap = 'round';
    canvas_context.lineJoin = 'round';
    canvas_context.lineWidth = this.props.e_select ? this.props.e_size: this.props.p_size;
    canvas_context.strokeStyle = this.props.e_select ? 'white' : this.props.color;
    canvas_context.fillStyle = 'white';
    //making sure that the canvas background is white so that when saving to a .png we don't get alpha channel background
    canvas_context.fillRect(0, 0, canvas.width, canvas.height); 
    
    //on mousepress, we get the current coordinates of the pointer, initialize the drawing phase and move to where the pointer is
    canvas.addEventListener('mousedown', function(e) {
      var offsetX = e.pageX - canvas.offsetLeft; 
      var offsetY = e.pageY - canvas.offsetTop;
      canvas_context.beginPath();
      canvas_context.moveTo(offsetX, offsetY);
      isDrawing = true;
    });

    //when the mouse moves, we draw the actual line from where we started alongside the mousepath and fill it
    canvas.addEventListener('mousemove', function(e) {
      if (!isDrawing) return;
      var offsetX = e.pageX - canvas.offsetLeft;
      var offsetY = e.pageY - canvas.offsetTop;
      canvas_context.lineTo(offsetX, offsetY);
      canvas_context.stroke();
    });

    //when we release the mouse button we take our last drawing, save it to a png and emit it
    canvas.addEventListener('mouseup', function() {
      canvas_context.closePath();
      isDrawing = false;
      var last_drawn_thing = canvas.toDataURL("image/png");
      root.socket.emit('canvas-drawing', last_drawn_thing);
    });
  }

  render() {
    return (
      <>
        <canvas className='main_canvas' id='main_canvas'/>
      </>
    )
  }
}

export default Whiteboard