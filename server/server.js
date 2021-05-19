var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);



var server_port = process.env.YOUR_PORT ||process.env.PORT || 5000;

http.listen(server_port, () => {
    console.log(`Server is listening on port ${server_port}`);
})

io.on("connection", socket => {
    console.log("User online");

    socket.on('canvas-drawing', (data) => {
        console.log('canvas drawing is being received');
        socket.broadcast.emit('canvas-drawing', data);
    })
}) 