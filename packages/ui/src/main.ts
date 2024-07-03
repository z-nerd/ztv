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
    { urls: "STUN:stun.dus.net:3478" },
    { urls: "STUN:stun.solcon.nl:3478" },
    { urls: "STUN:stun.gmx.net:3478" },
    { urls: "STUN:stun.gmx.de:3478" },
    { urls: "STUN:stun.sky.od.ua:3478" },
    { urls: "STUN:stun.voipia.net:3478" },
    { urls: "STUN:stun.voippro.com:3478" },
    { urls: "STUN:stun.voipzoom.com:3478" },
    { urls: "STUN:stun.voipstunt.com:3478" },
    { urls: "STUN:stun.voipbuster.com:3478" },
    { urls: "STUN:stun.voipcheap.co.uk:3478" },
    { urls: "STUN:stun.avoxi.com:3478" },

    { urls: "STUN:stun.skydrone.aero:3478" },
    { urls: "STUN:stun.ipfire.org:3478" },
    { urls: "STUN:stun.schlund.de:3478" },
    { urls: "STUN:stun.3wayint.com:3478" },
    { urls: "STUN:stun.3deluxe.de:3478" },
    { urls: "STUN:stun.bitburger.de:3478" },
    { urls: "STUN:stun.thinkrosystem.com:3478" },
    { urls: "STUN:stun.geesthacht.de:3478" },
    { urls: "STUN:stun.allflac.com:3478" },
    { urls: "STUN:stun.bearstech.com:3478" },
    { urls: "STUN:stun.vomessen.de:3478" },
    { urls: "STUN:stun.nfon.net:3478" },
    { urls: "STUN:stun.studio71.it:3478" },
    { urls: "STUN:stun.talkho.com:3478" },
    { urls: "STUN:stun.callromania.ro:3478" },

    { urls: "STUN:stun.synergiejobs.be:3478" },
    { urls: "STUN:stun.voys.nl:3478" },
    { urls: "STUN:stun.ixc.ua:3478" },
    { urls: "STUN:stun.telbo.com:3478" },

    { urls: "STUN:stun.openvoip.it:3478" },
    { urls: "STUN:stun.totalcom.info:3478" },
    { urls: "STUN:stun.babelforce.com:3478" },
    { urls: "STUN:stun.geonet.ro:3478" },

    { urls: "STUN:stun.easybell.de:3478" },
    { urls: "STUN:stun.jumblo.com:3478" },
    { urls: "STUN:stun.imp.ch:3478" },
    { urls: "STUN:stun.lowratevoip.com:3478" },

    { urls: "STUN:stun.voicetrading.com:3478" },
    { urls: "STUN:stun.syrex.co.za:3478" },
    { urls: "STUN:stun.logic.ky:3478" },
    { urls: "STUN:stun.zentauron.de:3478" },
    { urls: "STUN:stun.f.haeder.net:3478" },
    { urls: "STUN:stun.smartvoip.com:3478" },
    { urls: "STUN:stun.nonoh.net:3478" },

    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },

    { urls: "stun:stun2.l.google.com:5349" },
    { urls: "stun:stun1.l.google.com:5349" },
    { urls: "stun:stun.l.google.com:5349" },
    { urls: "stun:stun3.l.google.com:5349" },
    { urls: "stun:stun4.l.google.com:5349" },

    { urls: "stun:stun2.l.google.com:3478" },
    { urls: "stun:stun1.l.google.com:3478" },
    { urls: "stun:stun.l.google.com:3478" },
    { urls: "stun:stun3.l.google.com:3478" },
    { urls: "stun:stun4.l.google.com:3478" },
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
        video: true,
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
          peerCon.addTrack(track, localStream)
        })

        // peerCon.addEventListener("signalingstatechange", (event) => {})

        peerCon.addEventListener("icecandidate", (e) => {
          if (e.candidate) icecandidateChangeEmit({ icecandidate: e.candidate })
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
