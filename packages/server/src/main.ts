import { serve } from "@hono/node-server"
import { Hono } from "hono"
import { serveStatic } from "@hono/node-server/serve-static"
import { Server } from "socket.io"
import { join as pathJoin } from "path"
import { ztvRoom } from "./handler/ztvRoom"
import { totalUsers } from "./handler/totalUsers"
// import { ExpressPeerServer } from "peer"

export interface ZtvRoomUsers {
  id: string
}

let ztvRoomUsers: ZtvRoomUsers[] = []
const port = 80
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

const io = new Server(server)
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
  ztvRoom(io, socket)
  ztvRoomUsers.push({ id: socket.id })
  totalUsers(io, ztvRoomUsers)

  socket.on("disconnect", () => {
    ztvRoomUsers = ztvRoomUsers.filter((item) => item.id !== socket.id)
    totalUsers(io, ztvRoomUsers)
  })
})
