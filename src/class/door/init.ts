import { type Socket } from 'socket.io';
import DoorInstance from './instance.js'
export default class Doors {
  doors: { [key: string]: DoorInstance }
  constructor() {
    this.doors = {};
  }
  get(id: string) {
    return this.doors[id]
  }
  add(socket: Socket) {
    let id = socket.data.id;
    if (this.doors[id]) {
      this.remove(id)
    }
    this.doors[id] = new DoorInstance(socket, id)
  }
  remove(id: string) {
    delete this.doors[id]
  }

}
