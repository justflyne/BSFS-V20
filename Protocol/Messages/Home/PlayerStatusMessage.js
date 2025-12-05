const PiranhaMessage = require('../../PiranhaMessage')
const ByteStream = require("../../../ByteStream")
const database = require("../../../Database/DatabaseManager")
const LobbyInfoMessage = require("./LobbyInfoMessage")

class PlayerStatusMessage extends PiranhaMessage {
  constructor (bytes, session) {
    super(session)
    this.session = session
    this.id = 14366
    this.version = 0
    this.stream = new ByteStream(bytes)
  }

  async decode () {
    this.status = this.stream.readVInt()
  }

  async process () {
    if(this.status > 0){
      await database.replaceValue(this.session.lowID, 'lastOnline', new Date())
      await database.replaceValue(this.session.lowID, "status", this.status);
    }
    await new LobbyInfoMessage(this.session).send()
  }
}

module.exports = PlayerStatusMessage