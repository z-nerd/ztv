import { Socket as ServerSocket } from "socket.io"
import { Socket as ClientSocket } from "socket.io-client"
import { EmitMapClient, EmitMapServer } from "./events"

export interface EmitServerFnOption {
  room?: string
  broadcast?: boolean
  volatile?: boolean
}

export function emitServerFn(
  socket: ServerSocket,
): <K extends keyof EmitMapServer>(
  event: K,
) => (data: EmitMapServer[K], emitServerFnOption?: EmitServerFnOption) => void {
  return function (event) {
    return function (data, emitServerFnOption = {}) {
      emitServerFnOption.broadcast ??= false
      emitServerFnOption.volatile ??= true

      if (emitServerFnOption.room) {
        if (emitServerFnOption.volatile)
          socket.to(emitServerFnOption.room).volatile.emit(event, data)
        else socket.to(emitServerFnOption.room).emit(event, data)
      } else if (emitServerFnOption.broadcast) {
        if (emitServerFnOption.volatile)
          socket.broadcast.volatile.emit(event, data)
        else socket.broadcast.emit(event, data)
      } else {
        if (emitServerFnOption.volatile) socket.volatile.emit(event, data)
        else socket.emit(event, data)
      }
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
