import { io } from "socket.io-client";
import "dotenv/config";
import qrcode from "qrcode-terminal";
const MOCK_ID = "1231313123";
let host = `http://${process.env.HOST}:${process.env.PORT}`;
let clientSocket = io(host, {
  auth: (cb) => {
    cb({ user: { id: MOCK_ID }, token: process.env.SECRET_KEY });
  },
});

function generateQrCode(token) {
  let url = `${host}/door/${MOCK_ID}/${token}`;
  qrcode.generate(url)
  console.log(url)
}
let currentToken;
clientSocket.on("connect", () => {
  console.log("connect");
  clientSocket.emit("initial", (arg) => {
    currentToken = arg;
    generateQrCode(currentToken);
  });
});
clientSocket.on("connect_error", () => {
  console.log("connect_error");
});
clientSocket.on("open_door", (arg) => {
  currentToken = arg;
  console.log("open_door");
  generateQrCode(currentToken)
});


