import io from "socket.io-client";

export const socket = io("https://collaboard-server.herokuapp.com/");