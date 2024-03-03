import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { createServer } from "node:http";
import { type AddressInfo } from "node:net";
import { io as ioc, type Socket as ClientSocket } from "socket.io-client";
import { Server, type Socket as ServerSocket } from "socket.io";
import { createSocket } from "../src/class/io";
import { Doors as DoorsClass } from "../src/class/door/init.js";
import "dotenv/config";
const MOCK_ID = "1231313123";
const Doors = new DoorsClass();
// function waitFor(socket: ServerSocket | ClientSocket, event: string) {
//   return new Promise((resolve) => {
//     socket.once(event, resolve);
//   });
// }

describe("Door Connection", () => {
  let io: Server, serverSocket: ServerSocket, clientSocket: ClientSocket;
  let host: string;
  beforeAll(() => {
    return new Promise((resolve) => {
      const httpServer = createServer();
      io = createSocket(httpServer, Doors);
      httpServer.listen(() => {
        const port = (httpServer.address() as AddressInfo).port;
        host = `http://localhost:${port}`;
        resolve();
      });
    });
  });

  test("invalid token", () => {
    return new Promise((resolve) => {
      clientSocket = ioc(host, {
        auth: (cb) => {
          cb({ user: { id: MOCK_ID }, token: "123" });
        },
      });
      clientSocket.on("connect_error", (err) => {
        console.log(err);
        resolve(true);
      });
    });
  });

  test("valid token and id", () => {
    return new Promise((resolve) => {
      clientSocket = ioc(host, {
        auth: (cb) => {
          cb({ user: { id: MOCK_ID }, token: process.env.SECRET_KEY });
        },
      });
      io.on("connection", (socket) => {
        serverSocket = socket;
        expect(socket.data.id).toEqual(MOCK_ID);
      });
      clientSocket.on("connect", () => {
        resolve(true);
      });
    });
  });

  test("simple event", () => {
    return new Promise((resolve) => {
      clientSocket.on("hello", (arg) => {
        expect(arg).toEqual("world");
        resolve(true);
      });
      serverSocket.emit("hello", "world");
    });
  });
  let clientToken: string;
  test("token callback", () => {
    return new Promise((resolve) => {
      clientSocket.emit("initial", (arg: string) => {
        clientToken = arg;
        expect(clientToken).toEqual(Doors.get(serverSocket.data.id).getToken());
        resolve(true);
      });
    });
  });
  test("request new token", () => {
    return new Promise((resolve) => {
      let door = Doors.get(serverSocket.data.id);
      clientSocket.emit("request_new_token", clientToken, (arg: string) => {
        clientToken = arg;
        expect(clientToken).toEqual(door.getToken());
        resolve(true);
      });
    });
  });
  test("open door", () => {
    return new Promise((resolve) => {
      let door = Doors.get(serverSocket.data.id);
      door.openDoor();
      clientSocket.on("open_door", (arg) => {
        clientToken = arg;
        expect(arg).toEqual(door.getToken());
        resolve(true);
      });
    });
  });
  afterAll(() => {
    io.close();
    clientSocket?.disconnect();
  });
});
