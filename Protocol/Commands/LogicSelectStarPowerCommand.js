const PiranhaMessage = require('../PiranhaMessage')
const ByteStream = require("../../ByteStream")

class LogicSelectStarPowerCommand extends PiranhaMessage{
    constructor(bytes, session){
        super(bytes)
        this.session = session;
        this.commandID = 529
        this.version = 0        
        this.stream = new ByteStream(bytes);

    }

    decode(self){
        for (let i = 0; i < 10; i++) {
            this.stream.readVInt();
        }
        this.starPower = this.stream.readVInt();
    }

    async process(){
        this.session.starPowers = this.starPower
    }
}
module.exports = LogicSelectStarPowerCommand