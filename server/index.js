const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const cors = require('cors');

const { addUser, removeUser, getUser, getUsersInRoom } = require('./userHandling');

const router = require('./router');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(cors());
app.use(router);


let roomAssociatedEventListArray = new Map();



io.on("connect", socket => {
    console.log("User online");
    console.log(socket.id);


    socket.on('new-user-connected', ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room });
        if (error) return callback(error);

        if (roomAssociatedEventListArray.get(room) === undefined) {
            roomAssociatedEventListArray.set(room, {event_array: [], pointer: 0});
        }
        
        socket.join(user.room);

        io.in(user.room).emit('on-connect-emition', roomAssociatedEventListArray.get(user.room));
        console.log('connected to new user, sending out event data', roomAssociatedEventListArray.get(user.room));

        callback();
    });

    socket.on('text-addition', (newMarkdown) => {
        const user = getUser(socket.id);
        console.log('new markdown data', newMarkdown);
        let globalEventListForRoom = roomAssociatedEventListArray.get(user.room);
        globalEventListForRoom.event_array.push(newMarkdown);
        globalEventListForRoom.pointer += 1;
        io.in(user.room).emit('text-addition-emit', globalEventListForRoom);

        // console.log(data);
        // console.log('text is being received by the server and will shortly be emitted to every recipient');
        // if (global_event_list.pointer !== global_event_list.event_array.length) {
        //     global_event_list.event_array = global_event_list.event_array.slice(0, global_event_list.pointer);
        // }
        // let x = data;
        // let last_elem = x.pop();
        // global_event_list.event_array.push(['text', last_elem]);
        // if (global_event_list.event_array.length > 3) {
        //     let new_arr = global_event_list.event_array.slice(1, 4);
        //     global_event_list.event_array = new_arr;
        // }
        // global_event_list.pointer = global_event_list.event_array.length;
        // data.forEach(elem => {
        //     text_event_map.set(elem[0].toString(), elem.slice(1));
        // });
        // console.log(text_event_map);
        // io.in(user.room).emit('text-addition-emit', Array.from(text_event_map));
    });

    socket.on('text-edited', (editedMd) => {
        const user = getUser(socket.id);
        console.log('this markdown has been edited', editedMd);
        let globalEventListForRoom = roomAssociatedEventListArray.get(user.room);
        globalEventListForRoom.event_array.map(e => {
            if (e.markdownId === editedMd.markdownId) {
                console.log(editedMd);
                e.isEdited = true;
            }
            return e;
        });
        console.log('this is the event list with the editedMd marked', globalEventListForRoom.event_array);
        globalEventListForRoom.event_array.push(editedMd);
        globalEventListForRoom.pointer += 1;
        io.in(user.room).emit('text-addition-emit', globalEventListForRoom);
    });


    socket.on('text-deleted', (deletedMd) => {
        const user = getUser(socket.id);
        console.log('this markdown has been deleted', deletedMd);
        let globalEventListForRoom = roomAssociatedEventListArray.get(user.room);
        globalEventListForRoom.event_array.map(e => {
            if (e.markdownId === deletedMd.markdownId) {
                console.log(deletedMd);
                e.isDeleted = true;
            }
            return e;
        });
        console.log(globalEventListForRoom.event_array);
        io.in(user.room).emit('text-addition-emit', globalEventListForRoom);
    });

    socket.on('text-moved', (lastMovedMd) => {
        const user = getUser(socket.id);
        console.log('this markdown has been moved', lastMovedMd);
        let globalEventListForRoom = roomAssociatedEventListArray.get(user.room);
        globalEventListForRoom.event_array.map(e => {
            if (e.markdownId === lastMovedMd.markdownId) {
                console.log(lastMovedMd);
                e.isMoved = true;
            }
            return e;
        });
        globalEventListForRoom.event_array.push(lastMovedMd);
        globalEventListForRoom.pointer += 1;
        io.in(user.room).emit('text-addition-emit', globalEventListForRoom);
    });

    socket.on('canvas-drawing', (drawingData) => {
        const user = getUser(socket.id);
        console.log('new drawing data', drawingData);
        let globalEventListForRoom = roomAssociatedEventListArray.get(user.room);
        globalEventListForRoom.event_array.push(drawingData);
        globalEventListForRoom.pointer += 1;
        socket.broadcast.to(user.room).emit('canvas-drawing-emit', globalEventListForRoom);

        // const user = getUser(socket.id);
        // drawing_event_array.push(data);
        // if (global_event_list.pointer !== global_event_list.event_array.length) {
        //     global_event_list.event_array = global_event_list.event_array.slice(0, global_event_list.pointer);
        // }
        // global_event_list.event_array.push(['drawing', data]);
        // if (global_event_list.event_array.length > 3) {
        //     let new_arr = global_event_list.event_array.slice(1, 4);
        //     global_event_list.event_array = new_arr;
        // }
        // global_event_list.pointer = global_event_list.event_array.length;
        // socket.broadcast.to(user.room).emit('canvas-drawing-emit', data);
        console.log('drawing data has been received by the server and has been pushed to the array', globalEventListForRoom.event_array);
    });

    // socket.on('undo-request', (data) => {
    //     const user = getUser(socket.id);
    //     if (global_event_list.event_array !== []) {
    //         //zapisz wartość ostatniego 
    //         let last_handled_event = global_event_list.event_array[global_event_list.pointer - 1];
    //         //listę bez ostatniego eventu
    //         let until_last = global_event_list.event_array.slice(0, global_event_list.pointer);
    //         //podziel listę bez ostatniego eventu na rysunki i markdowny
    //         let drawings = until_last.filter(elem => elem[0] === 'drawing').map(elem => elem.slice(1)).flat();
    //         let mds = until_last.filter(elem => elem[0] === 'text').map(elem => elem.slice(1)).flat();
    //         if (last_handled_event[0] === 'drawing') {
    //             //usuń ostatni event z tablicy rysunków
    //             drawing_event_array.pop();
    //             //wyemituj tablicę rysunków
    //             io.in(user.room).emit('undo-drawing-request-from-server', drawings);
    //         } else {
    //             //usuń ostatni event z mapy markdownów
    //             let p = Array.from(text_event_map).pop();
    //             let x = new Map();
    //             p.forEach(elem => {
    //                 x.set(elem[0], elem.slice(1));
    //             });
    //             text_event_map = p;
    //             //wyemituj mapę markdownów
    //             io.in(user.room).emit('undo-text-request-from-server', mds);
    //         }
    //         //przesuń pointer globalnej tablicy eventów o 1 w lewo
    //         global_event_list.pointer = global_event_list.pointer - 1;
    //     }
    // });

    // socket.on('redo-request', (data) => {
    //     const user = getUser(socket.id);
    //     //jeśli pointer wskazuja na miejsce inne niż ostatni element listy
    //     if (global_event_list.pointer !== global_event_list.event_array.length) {
    //         //przesuń wskaźnik o jeden w prawo
    //         global_event_list.pointer = global_event_list.pointer + 1;
    //         //zapisz jaki był ostatni even, który teraz chcemy redo
    //         let last_handled_event = global_event_list.event_array[global_event_list.pointer];
    //         //zapisz tablicę, która ma redone element na końcu
    //         let until_last = global_event_list.event_array.slice(0, global_event_list.pointer + 1);
    //         //podziel zapisaną tablicę na rysunki i markdowny
    //         let drawings = until_last.filter(elem => elem[0] === 'drawing').map(elem => elem.slice(1)).flat();
    //         let mds = until_last.filter(elem => elem[0] === 'text').map(elem => elem.slice(1)).flat();
    //         if (last_handled_event[0] == "drawing") {
    //             //pushnąć drawing, który wcześniej został undid spowrotem do drawing array
    //             drawing_event_array.push(last_handled_event);
    //             //rozesłać listę rysunków
    //             io.in(user.room).emit('redo-drawing-request-from-server', drawings);
    //         } else {
    //             //pushnąć text, który wcześniej undo dostał
    //             let p = Array.from(text_event_map).push(last_handled_event.slice(1));
    //             let x = new Map;
    //             x.forEach(elem => x.set(elem[0], elem.slice(1)));
    //             //rozesłać listę markdownów
    //             io.in(user.room).emit('redo-text-request-from-server', mds);

    //         }

    //     }

    // });

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