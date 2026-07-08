import { io } from "socket.io-client";

// Trỏ về đúng địa chỉ Backend của em (cổng 5000)
const socket = io("https://btl-online-auction.onrender.com");

export default socket;