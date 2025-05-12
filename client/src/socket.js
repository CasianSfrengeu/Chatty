import { io } from "socket.io-client";

const socket = io("http://localhost:8000"); // trebuie să fie același cu serverul

export default socket;
