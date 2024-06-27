export interface JoinRoom {
  data: { room: string }
  cb?: (res: { status: "joined" | "unavailable" }) => void
}

export interface EventMapServer {
  "join-room": (data: JoinRoom["data"], cb?: JoinRoom["cb"]) => void
}

export interface EmitMapClient {
  "join-room": JoinRoom
}
