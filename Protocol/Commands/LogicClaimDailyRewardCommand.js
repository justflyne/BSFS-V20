const PiranhaMessage = require('../PiranhaMessage')
const ByteStream = require("../../ByteStream")
const database = require("../../Database/DatabaseManager")

class LogicClaimDailyRewardCommand extends PiranhaMessage{
    constructor(bytes, session){
        super(bytes)
        this.session = session;
        this.commandID = 503
        this.version = 0        
        this.stream = new ByteStream(bytes);
    }

    decode(self){
        for (let i = 0; i < 9; i++) {
            this.stream.readVInt();
        }
        this.slot = this.stream.readVInt()
    }

    async process(){        
        const account = await database.getAccount(this.session.lowID)        
        account.currencies.tokens += 20;
        await database.replaceValue(this.session.lowID, 'currencies', account.currencies);
    }        
}

module.exports = LogicClaimDailyRewardCommand