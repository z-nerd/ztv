import { Server, Socket } from "socket.io"

export const ztvRoom = (server: Server, socket: Socket) => {
  socket.on("join-ztv", (data) => {
    server.emit("ztv-stream", data)
  })
}
