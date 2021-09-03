const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const cors = require('cors');

const { addUser, removeUser, getUser, getUsersInRoom } = require('./userHandling');

const router = require('./router');
const { parse } = require('query-string');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: "*"
    }
});

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
            roomAssociatedEventListArray.set(room, { event_array: [], pointer: 0 });
        }

        socket.join(user.room);

        let globalEventListForRoom = roomAssociatedEventListArray.get(user.room);
        io.in(user.room).emit('on-connect-emition', globalEventListForRoom.event_array.slice(0, globalEventListForRoom.pointer));
        console.log('connected to new user, sending out event data', globalEventListForRoom.event_array.slice(0, globalEventListForRoom.pointer));

        callback();
    });

    socket.on('text-addition', (newMarkdown) => {
        const user = getUser(socket.id);
        console.log('new markdown data', newMarkdown);
        let globalEventListForRoom = roomAssociatedEventListArray.get(user.room);
        if (globalEventListForRoom.pointer !== globalEventListForRoom.event_array.length) {
            globalEventListForRoom.event_array = globalEventListForRoom.event_array.slice(0, globalEventListForRoom.pointer);
        }
        globalEventListForRoom.event_array.push(newMarkdown);
        globalEventListForRoom.pointer += 1;
        io.in(user.room).emit('text-addition-emit', globalEventListForRoom.event_array.slice(0, globalEventListForRoom.pointer));

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
        if (globalEventListForRoom.pointer !== globalEventListForRoom.event_array.length) {
            globalEventListForRoom.event_array = globalEventListForRoom.event_array.slice(0, globalEventListForRoom.pointer);
        }
        globalEventListForRoom.event_array.map(e => {
            if (e.markdownId === editedMd.markdownId) {
                console.log(editedMd);
                e.isEdited = true;
            }
            return e;
        });
        if (editedMd.isMoved === true) {
            editedMd.isMoved = false;
        }
        console.log('this is the event list with the editedMd marked', globalEventListForRoom.event_array);
        globalEventListForRoom.event_array.push(editedMd);
        globalEventListForRoom.pointer += 1;
        io.in(user.room).emit('text-addition-emit', globalEventListForRoom.event_array.slice(0, globalEventListForRoom.pointer));
    });


    socket.on('text-deleted', (deletedMd) => {
        const user = getUser(socket.id);
        console.log('this markdown has been deleted', deletedMd);
        let globalEventListForRoom = roomAssociatedEventListArray.get(user.room);
        if (globalEventListForRoom.pointer !== globalEventListForRoom.event_array.length) {
            globalEventListForRoom.event_array = globalEventListForRoom.event_array.slice(0, globalEventListForRoom.pointer);
        }
        globalEventListForRoom.event_array.map(e => {
            if (e.markdownId === deletedMd.markdownId) {
                console.log(deletedMd);
                e.isDeleted = true;
            }
            return e;
        });
        console.log(globalEventListForRoom.event_array);
        io.in(user.room).emit('text-addition-emit', globalEventListForRoom.event_array.slice(0, globalEventListForRoom.pointer));
    });

    socket.on('text-moved', (md) => {
        const user = getUser(socket.id);
        //console.log('this markdown has been moved', lastMovedMd);
        console.log(parseInt(md.id), md.xVal, md.yVal);
        let mdId = parseInt(md.id);
        let globalEventListForRoom = roomAssociatedEventListArray.get(user.room);
        if (globalEventListForRoom.pointer !== globalEventListForRoom.event_array.length) {
            globalEventListForRoom.event_array = globalEventListForRoom.event_array.slice(0, globalEventListForRoom.pointer);
        }
        let filtered = globalEventListForRoom.event_array.filter(e => e.markdownId === mdId).filter(e => e.isEdited === false);
        console.log(filtered);
        let val = filtered[filtered.length - 1].markdownText;
        let checkForClicks = globalEventListForRoom.event_array.filter(e => e.markdownId === mdId).filter(e => ((e.positionX === md.xVal) && (e.positionY === md.yVal)));
        globalEventListForRoom.event_array.map(e => {
            if (e.markdownId === mdId) {
                // if (e.positionX !== md.xVal && e.positionY !== md.yVal) {
                //     e.isMoved = true;
                // }
                e.isMoved = true;
                

            }
            return e;
        });
        console.log(val);
        console.log(checkForClicks);
        if (checkForClicks.length === 0) {
            globalEventListForRoom.event_array.push({ dataType: "text", markdownId: mdId, markdownText: val, positionX: md.xVal, positionY: md.yVal, isEdited: false, isDeleted: false, isMoved: false });
            globalEventListForRoom.pointer += 1;
            io.in(user.room).emit('text-addition-emit', globalEventListForRoom.event_array.slice(0, globalEventListForRoom.pointer));
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
        socket.broadcast.to(user.room).emit('canvas-drawing-emit', globalEventListForRoom.event_array.slice(0, globalEventListForRoom.pointer));

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
        console.log('drawing data has been received by the server and has been pushed to the array', globalEventListForRoom.event_array.slice(0, globalEventListForRoom.pointer));
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

    socket.on('undo-request', () => {
        const user = getUser(socket.id);
        let globalEventListForRoom = roomAssociatedEventListArray.get(user.room);
        if (globalEventListForRoom.pointer >= 1) {
            let slicedList = globalEventListForRoom.event_array.slice(0, globalEventListForRoom.pointer - 1);
            let lastElement = slicedList[slicedList.length - 1];
            if (lastElement !== undefined) {
                if (lastElement.isEdited === true) {
                    lastElement.isEdited = false;
                }
                if (lastElement.isDeleted === true) {
                    lastElement.isDeleted = false;
                }
                if (lastElement.isMoved === true) {
                    lastElement.isMoved = false;
                }
            }

            globalEventListForRoom.pointer -= 1;
            io.in(user.room).emit('undo-request-from-server', slicedList);
        }

    })

    socket.on('redo-request', () => {
        const user = getUser(socket.id);
        let globalEventListForRoom = roomAssociatedEventListArray.get(user.room);
        if (globalEventListForRoom.pointer < globalEventListForRoom.event_array.length) {
            let lastUndidElement = globalEventListForRoom.event_array[globalEventListForRoom.pointer - 1];
            if (lastUndidElement.isEdited === false) {
                lastUndidElement.isEdited = true;
            }
            if (lastUndidElement.isDeleted === false) {
                lastUndidElement.isDeleted = true;
            }
            if (lastUndidElement.isMoved === false) {
                lastUndidElement.isMoved = true;
            }
            globalEventListForRoom.pointer += 1;
            io.in(user.room).emit('redo-request-from-server', globalEventListForRoom.event_array.slice(0, globalEventListForRoom.pointer));
        }



    });

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