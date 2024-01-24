import express from 'express'
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import 'dotenv/config' 
// import DoorClass from './class/door.js';
const app = express();
const server = createServer(app);
const io = new Server(server)
const PORT = 5000
// const Door = new DoorClass(io)
io.on('connection', (socket) => {
  console.log(socket , 'connected')
})
app.get('/', (_req, res) => {
  res.send('<h1>Hello world</h1>');
});

server.listen(PORT, () => {
  console.log(`server running at http://localhost:${PORT}`);
});
