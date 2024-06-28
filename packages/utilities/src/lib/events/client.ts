export interface EventMapClient {
  "quit-room": (data: { room: string }) => void
  "unavailable-room": () => void
  "create-offer": () => void
  "answer-offer": (data: { offer: RTCSessionDescriptionInit }) => void
  "add-answer": (data: { answer: RTCSessionDescriptionInit }) => void
  "add-icecandidate": (data: { icecandidate: RTCIceCandidate }) => void
}

export interface EmitMapServer {
  "quit-room": {
    room: string
  }
  "unavailable-room": {}
  "create-offer": {}
  "answer-offer": { offer: RTCSessionDescriptionInit }
  "add-answer": { answer: RTCSessionDescriptionInit }
  "add-icecandidate": { icecandidate: RTCIceCandidate }
}
