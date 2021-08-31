import io from "socket.io-client";

export const socket = io.connect("https://quizzical-borg-ced3aa.netlify.app");