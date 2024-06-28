import { serve } from "@hono/node-server"
import { Hono } from "hono"
import { serveStatic } from "@hono/node-server/serve-static"
import { Server } from "socket.io"
import { join as pathJoin } from "path"
import { EventMapServer, emitServerFn } from "@ztv/utilities"

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
  const createOfferEmit = emit("create-offer")
  const answerOfferEmit = emit("answer-offer")
  const addAnswerEmit = emit("add-answer")
  const addIcecandidateEmit = emit("add-icecandidate")

  socket.on("join-room", async ({ room }, cb) => {
    const socketsInRoom = await io.in(room).fetchSockets()

    const totalUserInRoom = socketsInRoom.length
    if (totalUserInRoom < 2) {
      socket.join(room)
      if (cb) cb({ status: "joined", totalUserInRoom })
      if (totalUserInRoom === 1) createOfferEmit({}, { room })
    } else {
      if (cb) cb({ status: "unavailable" })
    }
  })

  socket.on("new-offer", ({ offer }) => {
    let room = [...socket.rooms].at(1)
    if (room) {
      answerOfferEmit({ offer }, { room })
    }
  })

  socket.on("new-answer", ({ answer }) => {
    let room = [...socket.rooms].at(1)
    if (room) {
      addAnswerEmit({ answer }, { room })
    }
  })

  socket.on("icecandidate-change", ({ icecandidate }) => {
    let room = [...socket.rooms].at(1)
    if (room) {
      addIcecandidateEmit({ icecandidate }, { room })
    }
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
