const PiranhaMessage = require('../PiranhaMessage')
const ByteStream = require("../../ByteStream")
const database = require('../../Database/DatabaseManager');

class LogicOffersChangedCommand extends PiranhaMessage {
    constructor(bytes, session) {
        super(bytes);
        this.session = session;
        this.commandID = 211;
        this.version = 0;
        this.stream = new ByteStream(bytes);
    }

    decode() {
        this.View = this.stream.readVInt()
    }

    async process() {
        const account = await database.getAccount(this.session.lowID);
        const offer = account.shop.find(shop => shop.isViewed === this.View);
        offer.shop.isViewed = 2
        
    }
}

module.exports = LogicOffersChangedCommand;