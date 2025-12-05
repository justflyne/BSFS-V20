const PiranhaMessage = require('../../PiranhaMessage')
const ByteStream = require("../../../ByteStream")
const LobbyInfoMessage = require('./LobbyInfoMessage')
const ClientCapabilitiesMessage = require('./ClientCapabilitiesMessage')

class KeepAliveMessage extends PiranhaMessage {
  constructor (bytes, session) {
    super(session)
    this.session = session
    this.id = 10108
    this.version = 0
    this.stream = new ByteStream(bytes)
  }

  async decode () {
    this.stream.readInt()
  }

  async process () {    
    await new ClientCapabilitiesMessage(this.stream, this.session).send()
    await new LobbyInfoMessage(this.session).send()
  }
}

module.exports = KeepAliveMessage