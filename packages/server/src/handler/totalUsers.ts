import { Server } from "socket.io"
import { ZtvRoomUsers } from "../main"

export const totalUsers = (server: Server, ztvRoomUsers: ZtvRoomUsers[]) => {
  server.emit("totalUsers", ztvRoomUsers.length)
}
