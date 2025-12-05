const PiranhaMessage = require("../PiranhaMessage");
const ByteStream = require("../../ByteStream")
const database = require("../../Database/DatabaseManager")

class LogicSelectSkinCommand extends PiranhaMessage{
    constructor(bytes, session){
        super(bytes)
        this.session = session;        
        this.commandID = 506
        this.version = 0
        this.stream = new ByteStream(bytes)
    }

    decode(self){
        for (let i = 0; i < 10; i++) {
            this.stream.readVInt();
        }
        
        this.skinId = this.stream.readVInt()
        
        for (let i = 0; i < 6; i++) {
            this.stream.readVInt();
        }
        
        this.brawlerId = this.stream.readVInt()
    }

    async process(){
        this.session.skinId = this.skinId;
        this.session.brawlerId = this.brawlerId;
        await database.replaceValue(this.session.lowID, 'skinId', this.skinId);
        await database.replaceValue(this.session.lowID, 'brawlerId', this.brawlerId);
    }
}

module.exports = LogicSelectSkinCommand