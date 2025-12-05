const PiranhaMessage = require('../../PiranhaMessage')
const ByteStream = require("../../../ByteStream")
class SetNameCallbackMessage extends PiranhaMessage {
  constructor(session, Name) {
    super(session);
    this.id = 24111;
    this.session = session;
    this.Name = Name
    this.version = 0;
    this.stream = new ByteStream();
  }

  async encode() {
    this.stream.writeVInt(201);
    this.stream.writeString(this.Name);
    this.stream.writeVInt(0);
  }
}

module.exports = SetNameCallbackMessage;