import { type Server as NodeServer } from "node:http";
import { Server as SocketServer } from "socket.io";
import type DoorsClass from "./door/init.js";
export interface ServerToClientEvents {
  // noArg: () => void;
  // basicEmit: (a: number, b: string, c: Buffer) => void;
  // withAck: (d: string, callback: (e: number) => void) => void;
}

export interface ClientToServerEvents {
  // hello: () => void;
}

export interface InterServerEvents {
  // ping: () => void;
}

export interface SocketData {
  id: string;
}

let io: SocketServer;
export function createSocket(nodeServer: NodeServer, Doors: DoorsClass) {
  if (!io) {
    io = new SocketServer<
      ClientToServerEvents,
      ServerToClientEvents,
      InterServerEvents,
      SocketData
    >(nodeServer);
    initEvent(io, Doors);
  }
  return io;
}

function initEvent(io: SocketServer, Doors: DoorsClass) {
  io.use(function(socket, next) {
    const auth = socket.handshake.auth;
    if (!(auth.token === process.env.SECRET_KEY)) {
      next(new Error("Authentication error"));
    }
    socket.data = auth.user;
    next();
  });
  io.on("connection", (socket) => {
    Doors.add(socket);
  });
  io.on("disconnect", (socket) => {
    Doors.remove(socket.data.id);
  });
}
