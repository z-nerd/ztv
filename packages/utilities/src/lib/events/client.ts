export interface EventMapClient {
  "quit-room": (data: { room: string }) => void
}

export interface EmitMapServer {
  "quit-room": {
    room: string
  }
}
