import { type Socket } from "socket.io";
import { ulid } from "ulid";

export default class DoorInstance {
  id: string;
  token: string;
  socket: Socket
  initial = false;
  constructor(socket: Socket, id: string) {
    this.socket = socket;
    this.id = id;
    this.token = ulid();

    socket.on("request_token", (callback: (token: string) => void) => {
      if (this.initial) {
        return;
      }
      this.initial = true;
      callback(this.getToken());
    });
  }
  getToken() {
    return this.token;
  }
  checkToken(token: string) {
    return token === this.token;
  }
  newToken() {
    this.token = ulid();
  }
  openDoor() {
    this.newToken();
    this.socket.emit("open_door", this.token);
  }

  updateToken() {
    this.newToken();
    this.socket.emit("update_token", this.token);
  }
}
