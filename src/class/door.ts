import { ulid } from 'ulid'

export default class Door{
  id:string
  name:string
  qrtoken:string
 constructor(id) {
    this.id = id
    this.name = name
    this.qrtoken = ulid()
  }
}

