const PiranhaMessage = require('../../PiranhaMessage')
const ByteStream = require("../../../ByteStream")
const database = require("../../../Database/DatabaseManager")
const OwnHomeDataMessage = require("../Home/OwnHomeDataMessage")
class GoHomeFromOfflinePractiseMessage extends PiranhaMessage {
  constructor (bytes, session) {
    super(session)
    this.session = session
    this.id = 14109
    this.version = 0
    this.stream = new ByteStream(bytes)
  }

  async decode () {
    // useless
  }

  async process () {
    const account = await database.getAccount(this.session.lowID);
    new OwnHomeDataMessage(this.session, account).send();
  }
}

module.exports = GoHomeFromOfflinePractiseMessage