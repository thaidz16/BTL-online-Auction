import { io } from "socket.io-client";

// Trỏ về đúng địa chỉ Backend của em (cổng 5000)
const socket = io("http://localhost:5000");

export default socket;