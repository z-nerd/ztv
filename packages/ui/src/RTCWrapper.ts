export class RTCWrapper extends RTCPeerConnection {
  constructor(configuration?: RTCConfiguration) {
    super(configuration)
  }

  // User1 create an offer
  async makeOffer(onIceChangeFn?: (e: RTCPeerConnectionIceEvent) => void) {
    this.onicecandidate = async (event) => {
      //Event that fires off when a new offer ICE candidate is created
      if (event.candidate) {
        // User1 emit offer to user2
        // this.localDescription
        if (onIceChangeFn) onIceChangeFn(event)
      }
    }

    const offer = await this.createOffer()
    await this.setLocalDescription(offer)

    return offer
  }

  // User2 listion to User1 event of create offer
  async makeAnswer(
    offer: RTCSessionDescription,
    onIceChangeFn?: (e: RTCPeerConnectionIceEvent) => void,
  ) {
    this.onicecandidate = async (event) => {
      //Event that fires off when a new answer ICE candidate is created
      if (event.candidate) {
        // User2 emit answer to user1
        // this.localDescription
        if (onIceChangeFn) onIceChangeFn(event)
      }
    }

    await this.setRemoteDescription(offer)
    const answer = await this.createAnswer()
    await this.setLocalDescription(answer)

    return answer
  }

  // User1 wait for User2 to answer its offer
  async addAnswer(answer: RTCSessionDescriptionInit) {
    if (!this.currentRemoteDescription) {
      this.setRemoteDescription(answer)
    }
  }
}
