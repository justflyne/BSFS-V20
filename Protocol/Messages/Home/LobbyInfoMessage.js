const PiranhaMessage = require('../../PiranhaMessage')
const ByteStream = require("../../../ByteStream")

class LobbyInfoMessage extends PiranhaMessage {
  constructor (session) {
    super(session)
    this.id = 23457
    this.session = session
    this.version = 0
    this.stream = new ByteStream()
  }

  async encode () {
    this.stream.writeVInt(global.online)
    this.stream.writeString(`Project BSFS\nTG: @projectbsfs\nVersion: v20.93`)
    this.stream.writeVInt(1)
  }
}

module.exports = LobbyInfoMessage
