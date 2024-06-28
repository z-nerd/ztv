import { Socket as ServerSocket } from "socket.io"
import { Socket as ClientSocket } from "socket.io-client"
import { EmitMapClient, EmitMapServer } from "./events"

export interface EmitServerFnOption {
  room?: string
  broadcast?: boolean
}

export function emitServerFn(
  socket: ServerSocket,
): <K extends keyof EmitMapServer>(
  event: K,
) => (data: EmitMapServer[K], emitServerFnOption?: EmitServerFnOption) => void {
  return function (event) {
    return function (data, emitServerFnOption = {}) {
      emitServerFnOption.broadcast ??= false
      if (emitServerFnOption.room)
        socket.to(emitServerFnOption.room).emit(event, data)
      else if (emitServerFnOption.broadcast) socket.broadcast.emit(event, data)
      else socket.emit(event, data)
    }
  }
}

export function emitClientFn(
  socket: ClientSocket,
): <K extends keyof EmitMapClient>(
  event: K,
) => (data: EmitMapClient[K]["data"], cb?: EmitMapClient[K]["cb"]) => void {
  return function (event) {
    return function (data, cb) {
      socket.emit(event, data, cb)
    }
  }
}
