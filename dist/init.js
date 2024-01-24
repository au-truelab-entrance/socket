"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const node_http_1 = require("node:http");
const socket_io_1 = require("socket.io");
require("dotenv/config");
// import DoorClass from './class/door.js';
const app = (0, express_1.default)();
const server = (0, node_http_1.createServer)(app);
const io = new socket_io_1.Server(server);
const PORT = 5000;
// const Door = new DoorClass(io)
io.on('connection', (socket) => {
    console.log(socket, 'connected');
});
app.get('/', (_req, res) => {
    res.send('<h1>Hello world</h1>');
});
server.listen(PORT, () => {
    console.log(`server running at http://localhost:${PORT}`);
});
//# sourceMappingURL=init.js.map