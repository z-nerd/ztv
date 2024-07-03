import "./reset.scss"
import "./app.scss"
import socketIO, { Socket } from "socket.io-client"
import { v4 as uuid } from "uuid"
import { EventMapClient, emitClientFn } from "@ztv/utilities"

const environment = process.env.NODE_ENV
const isDevelopment = environment === "development"

const urlParams = new URLSearchParams(window.location.search)
let roomId = urlParams.get("roomId")!
if (!roomId) document.location = `?roomId=${uuid()}`

const localVideoRef = document.querySelector<HTMLVideoElement>("#local")!
const remoteVideoRef = document.querySelector<HTMLVideoElement>("#remote")!
// const totalUsersRef = document.querySelector<HTMLVideoElement>("#text")!

let peerCfg: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },

    { urls: "stun:stun.l.google.com:3478" },
    { urls: "stun:stun1.l.google.com:3478" },
    { urls: "stun:stun2.l.google.com:3478" },
    { urls: "stun:stun3.l.google.com:3478" },
    { urls: "stun:stun4.l.google.com:3478" },

    { urls: "STUN:stun.voippro.com:3478" },
    { urls: "STUN:stun.smartvoip.com:3478" },
    { urls: "STUN:stun.3wayint.com:3478" },

    { urls: "STUN:stun.ipfire.org:3478" },

    { urls: "STUN:stun.gmx.net:3478" },
    { urls: "STUN:stun.voipia.net:3478" },
    { urls: "STUN:stun.f.haeder.net:3478" },
  ],
}
let peerCon: RTCPeerConnection
let localStream: MediaStream
let remoteStream: MediaStream

const io = socketIO(
  isDevelopment ? "ws://localhost:3000" : "",
) as Socket<EventMapClient>

const emit = emitClientFn(io)
const joinRoomEmit = emit("join-room")
const newOfferEmit = emit("new-offer")
const newAnswerEmit = emit("new-answer")
const icecandidateChangeEmit = emit("icecandidate-change")

const getUserMedia = () => {
  return new Promise(async (resolve: (stream: MediaStream) => void, reject) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          frameRate: {
            max: 60,
            min: 15,
          },
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
        },
      })

      localStream = stream
      localVideoRef.srcObject = localStream

      resolve(stream)
    } catch (err) {
      reject(err)
    }
  })
}

const createPeerConnection = (
  offer: RTCSessionDescriptionInit | undefined = undefined,
) => {
  return new Promise(
    async (resolve: (pc: RTCPeerConnection) => void, reject) => {
      try {
        await getUserMedia()

        remoteStream = new MediaStream()
        remoteVideoRef.srcObject = remoteStream

        peerCon = new RTCPeerConnection(peerCfg)
        localStream.getTracks().forEach((track) => {
          track.contentHint = "motion"
          peerCon.addTrack(track, localStream)
        })

        // peerCon.addEventListener("signalingstatechange", (e) => {})

        peerCon.addEventListener("icecandidate", async (e) => {
          if (e.candidate && peerCon.signalingState === "stable") {
            icecandidateChangeEmit({ icecandidate: e.candidate })
            peerCon
              .addIceCandidate(e.candidate)
              .catch((err) => console.error(err))
          }
        })

        peerCon.addEventListener("track", (e) => {
          e.streams[0].getTracks().forEach((track) => {
            remoteStream.addTrack(track)
          })
        })

        if (offer) {
          await peerCon.setRemoteDescription(offer)
        }
        resolve(peerCon)
      } catch (err) {
        reject(err)
      }
    },
  )
}

io.on("connect", () => {
  joinRoomEmit(
    {
      room: roomId,
    },
    async ({ status }) => {
      if (status === "joined") await getUserMedia()
      if (status === "unavailable") alert("Room is unavailable!")
    },
  )
})

io.on("create-offer", async () => {
  await createPeerConnection()

  try {
    const offer = await peerCon.createOffer()
    peerCon.setLocalDescription(offer)
    newOfferEmit({ offer })
  } catch (err) {
    console.log(err)
  }
})

io.on("answer-offer", async ({ offer }) => {
  await createPeerConnection(offer)

  try {
    const answer = await peerCon.createAnswer()
    await peerCon.setLocalDescription(answer)
    newAnswerEmit({ answer })
  } catch (err) {
    console.log(err)
  }
})

io.on("add-answer", async ({ answer }) => {
  await peerCon.setRemoteDescription(answer)
})

io.on("add-icecandidate", async ({ icecandidate }) => {
  if (peerCon) peerCon.addIceCandidate(icecandidate)
})
