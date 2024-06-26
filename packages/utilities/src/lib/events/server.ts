export interface EventMapServer {
  "join-room": (data: { room: string }) => void
}

export interface EmitMapClient {
  "join-room": {
    room: string
  }
}
