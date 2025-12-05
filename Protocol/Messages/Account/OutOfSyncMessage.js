const PiranhaMessage = require('../../PiranhaMessage')
const ByteStream = require("../../../ByteStream")

class OutOfSyncMessage extends PiranhaMessage {
  constructor(session) {
    super(session);
    this.id = 25892;
    this.session = session;
    this.version = 0;
    this.stream = new ByteStream();
    
  }

  async encode() {
    this.stream.writeInt(2); 
  }
}

module.exports = OutOfSyncMessage;