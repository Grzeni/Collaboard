import io from "socket.io-client";

export const socket = io("https://exemplary-point-325110.appspot.com/", {
    transports: ['polling', 'websocket']
});