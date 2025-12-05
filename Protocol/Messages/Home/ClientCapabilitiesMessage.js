const PiranhaMessage = require('../../PiranhaMessage')
const ByteStream = require("../../../ByteStream")

class ClientCapabilitiesMessage extends PiranhaMessage{
    constructor(bytes, session){
        super(bytes)
        this.session = session;        
        this.id = 10107
        this.version = 0
        this.stream = new ByteStream(bytes)
    }

    async decode(){
        this.session.latency = this.stream.readVInt()
    }

    async process(){
    // For what?
    }
}

module.exports = ClientCapabilitiesMessage