import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { createServer } from "node:http";
import { type AddressInfo } from "node:net";
import { io as ioc, type Socket as ClientSocket } from "socket.io-client";
import { Server, type Socket as ServerSocket } from "socket.io";
import { createSocket } from "../src/class/io";
import "dotenv/config";
const MOCK_ID = '1231313123'

function waitFor(socket: ServerSocket | ClientSocket, event: string) {
  return new Promise((resolve) => {
    socket.once(event, resolve);
  });
}

describe("Door Connection", () => {
  let io: Server, serverSocket: ServerSocket, clientSocket: ClientSocket;
  let host: string;
  beforeAll(() => {
    return new Promise((resolve) => {
      const httpServer = createServer();
      io = createSocket(httpServer);
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
        expect(socket.data.id).toEqual(MOCK_ID)
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


  test("token callback", ()=> {

  })
  //
  //test("should work with an acknowledgement", () => {
  //   return new Promise((resolve) => {
  //     serverSocket.on("hi", (cb) => {
  //       cb("hola");
  //     });
  //     clientSocket.emit("hi", (arg) => {
  //       expect(arg).toEqual("hola");
  //       resolve();
  //     });
  //   });
  // });
  //
  //test("should work with emitWithAck()", async () => {
  //   serverSocket.on("foo", (cb) => {
  //     cb("bar");
  //   });
  //   const result = await clientSocket.emitWithAck("foo");
  //   expect(result).toEqual("bar");
  // });
  //
  //test("should work with waitFor()", () => {
  //   clientSocket.emit("baz");
  //
  //   return waitFor(serverSocket, "baz");
  // });
  afterAll(() => {
    io.close();
    clientSocket?.disconnect()
  });
});
