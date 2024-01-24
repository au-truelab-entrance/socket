import express from 'express'
import { createServer } from 'node:http';
import { createSocket } from './class/io.js';
import 'dotenv/config' 
const PORT = process.env.PORT
const app = express();
const nodeServer = createServer(app);
const io = createSocket(nodeServer);

app.get('/', (_req, res) => {
  res.send('<h1>Hello world</h1>');
});

nodeServer.listen(PORT, () => {
  console.log(`server running at http://localhost:${PORT}`);
});
