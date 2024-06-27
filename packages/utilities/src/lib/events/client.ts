export interface EventMapClient {
  "quit-room": (data: { room: string }) => void
  "unavailable-room": () => void
}

export interface EmitMapServer {
  "quit-room": {
    room: string
  }
  "unavailable-room": {}
}
