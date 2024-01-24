import {type Server as NodeServer } from "node:http";
import { Server as SocketServer } from "socket.io";
export interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
}

export interface ClientToServerEvents {
  hello: () => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  name: string;
  age: number;
}

let io:SocketServer;
export function createSocket(nodeServer:NodeServer) {
  if (!io) { 
    io = new SocketServer<
      ClientToServerEvents,
      ServerToClientEvents,
      InterServerEvents,
      SocketData>(nodeServer)
    initEvent(io)
  };
  return io
} 

function initEvent(io:SocketServer){
  io.on('connection', (socket) => {
    console.log(socket, 'connected')
  })
}
