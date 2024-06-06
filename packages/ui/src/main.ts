import "./components"
import "./reset.scss"
import "./app.scss"
import socketIO from "socket.io-client"
import Peer from "peerjs"

const localVideoRef = document.querySelector<HTMLVideoElement>("#self")!
const remoteVideoRef = document.querySelector<HTMLVideoElement>("#stranger")!
const totalUsersRef = document.querySelector<HTMLVideoElement>("#text")!

const io = socketIO()

const peer = new Peer({
  host: "/",
  port: 3000,
})

let localPeerId: string | null = null
let localStream: MediaStream | null = null
peer.on("open", (id) => {
  localPeerId = id
})

try {
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: true })
    .then((stream) => {
      localVideoRef.srcObject = stream
      localStream = stream
      peer.on("call", (call) => {
        call.answer(stream)
        call.on("stream", (remoteStream) => {
          remoteVideoRef.srcObject = remoteStream
        })
      })

      if (localPeerId)
        io.emit("join-ztv", { name: "zero", peerId: localPeerId })
    })
} catch (error) {
  console.error(`Can't get your video and audio: ${error}`)
}

io.on("ztv-stream", ({ peerId }) => {
  if (peerId !== localPeerId && localStream) {
    const call = peer.call(peerId, localStream)

    call.on("stream", (stream) => {
      remoteVideoRef.srcObject = stream
    })

    call.on("close", () => {
      console.log("close")
    })
  }
})

io.on("totalUsers", (e) => {
  totalUsersRef.innerHTML = e
})
