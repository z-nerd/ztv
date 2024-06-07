import "./reset.scss"
import "./app.scss"
import { RTCWrapper } from "./RTCWrapper"
import socketIO from "socket.io-client"
const localVideoRef = document.querySelector<HTMLVideoElement>("#self")!
const remoteVideoRef = document.querySelector<HTMLVideoElement>("#stranger")!
const totalUsersRef = document.querySelector<HTMLVideoElement>("#text")!

const rtcWrapper = new RTCWrapper({
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun.l.google.com:5349" },
    { urls: "stun:stun1.l.google.com:3478" },
    { urls: "stun:stun1.l.google.com:5349" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:5349" },
    { urls: "stun:stun3.l.google.com:3478" },
    { urls: "stun:stun3.l.google.com:5349" },
    { urls: "stun:stun4.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:5349" },
  ],
})
let localStream: MediaStream
let remoteStream: MediaStream
const io = socketIO()

const init = async () => {
  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  })
  remoteStream = new MediaStream()

  localVideoRef.srcObject = localStream
  remoteVideoRef.srcObject = remoteStream

  localStream.getTracks().forEach((track) => {
    rtcWrapper.addTrack(track, localStream)
  })

  rtcWrapper.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track)
    })
  }

  await rtcWrapper.makeOffer()

  io.on("ztv-stream", async ({ id, localDescription }) => {
    if (id !== io.id) {
      const answer = await rtcWrapper.makeAnswer(localDescription)
      rtcWrapper.addAnswer(answer)
    }
  })
}

init()

io.on("totalUsers", (e) => {
  totalUsersRef.innerHTML = e
})

setTimeout(() => {
  io.emit("join-ztv", {
    id: io.id,
    localDescription: rtcWrapper.localDescription,
  })
}, 6000)
