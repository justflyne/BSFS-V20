const PiranhaMessage = require('../../PiranhaMessage')
const ByteStream = require("../../../ByteStream")
const database = require("../../../Database/DatabaseManager")
const PlayerProfileMessage = require("./PlayerProfileMessage");

class GetPlayerProfileMessage extends PiranhaMessage {
  constructor (bytes, session) {
    super(session)
    this.session = session
    this.id = 14113
    this.version = 0
    this.stream = new ByteStream(bytes)
  }

  async decode () {
    this.lowID = this.stream.readLong()[1];
  }

  async process () {
    const account = await database.getAccount(this.lowID);
    new PlayerProfileMessage(this.session, account).send();
  }
}

module.exports = GetPlayerProfileMessage