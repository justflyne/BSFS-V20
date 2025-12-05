const PiranhaMessage = require("../PiranhaMessage");
const ByteStream = require("../../ByteStream")
const database = require("../../Database/DatabaseManager")

class LogicSetPlayerNameColorCommand extends PiranhaMessage{
    constructor(bytes, session, account){
        super(bytes)
        this.session = session;
        this.account = account;
        this.commandID = 527
        this.version = 0
        this.stream = new ByteStream(bytes)
    }

    decode(self){
        for (let i = 0; i < 10; i++) {
            this.stream.readVInt();
        }
        this.nameColor = this.stream.readVInt()
        //console.log(this.nameColor)
    }

    async process(){
        this.session.nameColor = this.nameColor
        await database.replaceValue(this.session.lowID, 'nameColor', this.nameColor);
    }
}

module.exports = LogicSetPlayerNameColorCommand