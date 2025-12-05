const PiranhaMessage = require("../PiranhaMessage");
const ByteStream = require("../../ByteStream")
const database = require("../../Database/DatabaseManager")

class LogicSetPlayerThumbnailCommand extends PiranhaMessage{
    constructor(bytes, session, account){
        super(bytes)
        this.session = session;
        this.account = account;
        this.commandID = 505
        this.version = 0
        this.stream = new ByteStream(bytes)
    }

    decode(self){
        for (let i = 0; i < 10; i++) {
            this.stream.readVInt();
        }
        this.thumbnail = this.stream.readVInt()
        //console.log(this.thumbnail)
    }

    async process(){
        this.session.thumbnail = this.thumbnail
        await database.replaceValue(this.session.lowID, 'thumbnail', this.thumbnail);
    }
}

module.exports = LogicSetPlayerThumbnailCommand