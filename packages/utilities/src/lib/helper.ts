import { Socket as ServerSocket } from "socket.io"
import { Socket as ClientSocket } from "socket.io-client"
import { EmitMapClient, EmitMapServer } from "./events"

export function emitServerFn(
  socket: ServerSocket,
): <K extends keyof EmitMapServer>(
  event: K,
) => (data: EmitMapServer[K]) => void {
  return function (event) {
    return function (data) {
      socket.broadcast.emit(event, data)
    }
  }
}

export function emitClientFn(
  socket: ClientSocket,
): <K extends keyof EmitMapClient>(
  event: K,
) => (data: EmitMapClient[K]) => void {
  return function (event) {
    return function (data) {
      socket.emit(event, data)
    }
  }
}
