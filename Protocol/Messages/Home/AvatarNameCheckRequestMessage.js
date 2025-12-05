const PiranhaMessage = require('../../PiranhaMessage')
const ByteStream = require("../../../ByteStream")
const database = require("../../../Database/DatabaseManager")
const SetNameCallback = require('./SetNameCallbackMessage')


class AvatarNameCheckRequestMessage extends PiranhaMessage {
  constructor (bytes, session) {
    super(session)
    this.session = session
    this.id = 14600
    this.version = 0
    this.stream = new ByteStream(bytes)
  }

  async decode () {
    this.Name = this.stream.readString()
  }

  async process () {
    this.session.name = this.Name;
    await database.replaceValue(this.session.lowID, 'name', this.session.name)
    new SetNameCallback(this.session, this.session.name).send()
  }
}

module.exports = AvatarNameCheckRequestMessage