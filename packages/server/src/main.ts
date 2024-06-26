import { serve } from "@hono/node-server"
import { Hono } from "hono"
import { serveStatic } from "@hono/node-server/serve-static"
import { Server } from "socket.io"
import { join as pathJoin } from "path"
import { EventMapServer, emitServerFn } from "@ztv/utilities"
// import { ztvRoom } from "./handler/ztvRoom"
// import { totalUsers } from "./handler/totalUsers"

const environment = process.env.NODE_ENV
const isDevelopment = environment === "development"

export interface ZtvRoomUsers {
  id: string
}

let ztvRoomUsers: ZtvRoomUsers[] = []
const port = isDevelopment ? 3000 : 80
const app = new Hono()

const server = serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`Listening on http://localhost:${info.port}`)
  },
)

const io = new Server(
  server,
  isDevelopment
    ? {
        cors: {
          origin: "*",
        },
      }
    : {},
) as Server<EventMapServer>

// const peerServer = ExpressPeerServer(server, {
//   host: "/",
//   port,
//   corsOptions: {
//     allowedHeaders: "*",
//     origin: "*",
//   },
// })
//
// app.use("/peerjs/*", peerServer)

// peerServer.on("connection", () => {
//   console.log("peer connect")
// })
//
// peerServer.on("disconnect", () => {
//   console.log("peer disconnect")
// })

app.use(
  "/*",
  serveStatic({
    root: ".",
    rewriteRequestPath(path) {
      if (path.match(/^\/api\//)) return ""
      if (path.match(/^\/myapp\//)) return ""
      else return pathJoin("statics", path)
    },
  }),
)

app.get("/api/hello", (c) => {
  return c.text("Hello World!")
})

io.on("connection", (socket) => {
  const emit = emitServerFn(socket)
  const quitRoomEmit = emit("quit-room")

  socket.on("join-room", ({ room }) => {
    console.log("join-room:", room)
    quitRoomEmit({ room })
  })
  // ztvRoom(io, socket)
  // ztvRoomUsers.push({ id: socket.id })
  // totalUsers(io, ztvRoomUsers)
  //
  // socket.on("disconnect", () => {
  //   ztvRoomUsers = ztvRoomUsers.filter((item) => item.id !== socket.id)
  //   totalUsers(io, ztvRoomUsers)
  // })
})
