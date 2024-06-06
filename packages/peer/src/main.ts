import { PeerServer } from "peer"

const port = 3000

const peerServer = PeerServer({
  port,
  corsOptions: {
    allowedHeaders: "*",
    origin: "*",
  },
})

peerServer.on("connection", (client: any) => {
  console.log(client.id, "connect")
})

peerServer.on("disconnect", (client: any) => {
  console.log(client.id, "disconnect")
})
