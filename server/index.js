const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const cors = require('cors');

const { addUser, removeUser, getUser, getUsersInRoom } = require('./userHandling');

const router = require('./router');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: "https://quizzical-borg-ced3aa.netlify.app"
    }
});

app.use(cors());
app.use(router);


let roomAssociatedEventListArray = new Map();



io.on("connect", socket => {
    console.log("User online");
    console.log(socket.id);
    console.log('server version:', "170920211313");

    //when a new user connects receive the user's username and room code and create a new user object
    socket.on('new-user-connected', ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room });
        if (error) return callback(error);

        //if the room to which the user connected already has an event list do nothing, else create an empty one
        if (roomAssociatedEventListArray.get(room) === undefined) {
            roomAssociatedEventListArray.set(room, { event_array: [], pointer: 0 });
        }

        socket.join(user.room);

        //emit the event list to the users
        let globalEventListForRoom = roomAssociatedEventListArray.get(user.room);
        io.in(user.room).emit('on-connect-emition', globalEventListForRoom);
        console.log('connected to new user, sending out event data', globalEventListForRoom);

        callback();
    });

    //when new text event or drawing event is being sent check if there were no undo requests before it, adjust the event list and push the new text to the event list,
    // then raise the pointer by 1 and emit the list to the desired recipients

    socket.on('text-addition', (newMarkdown) => {
        const user = getUser(socket.id);
        console.log('new markdown data', newMarkdown);
        let globalEventListForRoom = roomAssociatedEventListArray.get(user.room);
        if (globalEventListForRoom.pointer !== globalEventListForRoom.event_array.length) {
            globalEventListForRoom.event_array = globalEventListForRoom.event_array.slice(0, globalEventListForRoom.pointer);
        }
        globalEventListForRoom.event_array.push(newMarkdown);
        globalEventListForRoom.pointer += 1;
        io.in(user.room).emit('text-addition-emit', globalEventListForRoom);
    });

    socket.on('text-edited', (editedMd) => {
        const user = getUser(socket.id);
        console.log('this markdown has been edited', editedMd);
        let globalEventListForRoom = roomAssociatedEventListArray.get(user.room);
        if (globalEventListForRoom.pointer !== globalEventListForRoom.event_array.length) {
            globalEventListForRoom.event_array = globalEventListForRoom.event_array.slice(0, globalEventListForRoom.pointer);
        }
        console.log('this is the event list with the editedMd marked', globalEventListForRoom.event_array);
        globalEventListForRoom.event_array.push(editedMd);
        globalEventListForRoom.pointer += 1;
        io.in(user.room).emit('text-addition-emit', globalEventListForRoom);
    });

    socket.on('text-deleted', (deletedMd) => {
        const user = getUser(socket.id);
        console.log('this markdown has been deleted', deletedMd);
        let globalEventListForRoom = roomAssociatedEventListArray.get(user.room);
        if (globalEventListForRoom.pointer !== globalEventListForRoom.event_array.length) {
            globalEventListForRoom.event_array = globalEventListForRoom.event_array.slice(0, globalEventListForRoom.pointer);
        }
        globalEventListForRoom.event_array.push(deletedMd);
        globalEventListForRoom.pointer += 1;
        console.log(globalEventListForRoom.event_array);
        io.in(user.room).emit('text-addition-emit', globalEventListForRoom);
    });

    socket.on('text-moved', (md) => {
        const user = getUser(socket.id);
        console.log(parseInt(md.id), md.xVal, md.yVal);
        let mdId = parseInt(md.id);
        let globalEventListForRoom = roomAssociatedEventListArray.get(user.room);
        if (globalEventListForRoom.pointer !== globalEventListForRoom.event_array.length) {
            globalEventListForRoom.event_array = globalEventListForRoom.event_array.slice(0, globalEventListForRoom.pointer);
        }
        let filtered = globalEventListForRoom.event_array.filter(e => e.markdownId === mdId);
        console.log(filtered);
        let val = filtered[filtered.length - 1].markdownText;
        let checkForClicks = globalEventListForRoom.event_array.filter(e => e.markdownId === mdId).filter(e => ((e.positionX === md.xVal) && (e.positionY === md.yVal)));
        console.log(val);
        console.log(checkForClicks);
        if (checkForClicks.length === 0) {
            globalEventListForRoom.event_array.push({ dataType: "text", markdownId: mdId, markdownText: val, positionX: md.xVal, positionY: md.yVal, isDeleted: false });
            globalEventListForRoom.pointer += 1;
            io.in(user.room).emit('text-addition-emit', globalEventListForRoom);
        }
    });

    socket.on('canvas-drawing', (drawingData) => {
        const user = getUser(socket.id);
        console.log('new drawing data', drawingData);
        let globalEventListForRoom = roomAssociatedEventListArray.get(user.room);
        if (globalEventListForRoom.pointer !== globalEventListForRoom.event_array.length) {
            globalEventListForRoom.event_array = globalEventListForRoom.event_array.slice(0, globalEventListForRoom.pointer);
        }
        globalEventListForRoom.event_array.push(drawingData);
        globalEventListForRoom.pointer += 1;
        socket.broadcast.to(user.room).emit('canvas-drawing-emit', globalEventListForRoom);
        console.log('drawing data has been received by the server and has been pushed to the array', globalEventListForRoom);
    });

    //to be able to perform an undo the pointer of the event list has to be greater or equal to 1
    //in other words you can't go back if the event list is empty - there's no events to undo
    //when the condition is met simply decrement the pointer and send out the event list
    socket.on('undo-request', () => {
        const user = getUser(socket.id);
        let globalEventListForRoom = roomAssociatedEventListArray.get(user.room);
        if (globalEventListForRoom.pointer >= 1) {
            globalEventListForRoom.pointer -= 1;
            io.in(user.room).emit('undo-request-from-server', globalEventListForRoom);
        }
    })

    //similarily to undo, you can't redo an operation if there are no other operations after it in the event array
    //increment the pointer and send out the event list
    socket.on('redo-request', () => {
        const user = getUser(socket.id);
        let globalEventListForRoom = roomAssociatedEventListArray.get(user.room);
        if (globalEventListForRoom.pointer < globalEventListForRoom.event_array.length) {
            globalEventListForRoom.pointer += 1;
            io.in(user.room).emit('redo-request-from-server', globalEventListForRoom);
        }
    });

    //once all users in a room disconnect, clear out the rooms event list
    socket.on('disconnect', () => {
        const user = getUser(socket.id);
        const deletedUser = removeUser(socket.id);
        let listOfUsersLeft = getUsersInRoom(user.room);
        console.log(listOfUsersLeft);
        if (listOfUsersLeft.length === 0) {
            console.log('list of users is now empty, time to clear the array');
            roomAssociatedEventListArray.get(user.room).event_array = [];
            roomAssociatedEventListArray.pointer = 0;
        }
    });
});

server.listen(process.env.PORT || 5000, () => console.log(`Server has started.`));