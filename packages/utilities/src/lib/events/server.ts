export interface JoinRoom {
  data: { room: string }
  cb?: (res: {
    status: "joined" | "unavailable"
    totalUserInRoom?: number
  }) => void
}

export interface NewOffer {
  data: { offer: RTCSessionDescriptionInit }
  cb?: () => void
}

export interface NewAnswer {
  data: { answer: RTCSessionDescriptionInit }
  cb?: () => void
}

export interface IcecandidateChange {
  data: { icecandidate: RTCIceCandidate }
  cb?: () => void
}

export interface EventMapServer {
  "join-room": (data: JoinRoom["data"], cb?: JoinRoom["cb"]) => void
  "new-offer": (data: NewOffer["data"], cb?: NewOffer["cb"]) => void
  "new-answer": (data: NewAnswer["data"], cb?: NewAnswer["cb"]) => void
  "icecandidate-change": (
    data: IcecandidateChange["data"],
    cb?: IcecandidateChange["cb"],
  ) => void
}

export interface EmitMapClient {
  "join-room": JoinRoom
  "new-offer": NewOffer
  "new-answer": NewAnswer
  "icecandidate-change": IcecandidateChange
}
