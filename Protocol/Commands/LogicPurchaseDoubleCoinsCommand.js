const PiranhaMessage = require('../PiranhaMessage')
const ByteStream = require("../../ByteStream")
const database = require("../../Database/DatabaseManager")
const OutOfSyncMessage = require('../Messages/Account/OutOfSyncMessage');

const fs = require('fs');
class LogicPurchaseDoubleCoinsCommand extends PiranhaMessage {
    constructor(bytes, session) {
        super(bytes)
        this.session = session;
        this.commandID = 509
        this.version = 0        
        this.stream = new ByteStream(bytes);
    }

    decode(self) {
        // idk
    }

    async process() {
        const account = await database.getAccount(this.session.lowID)
        if (account.gems - 50 < 0) {
            return new OutOfSyncMessage(this.session).send();
        }
        else {
            account.tokensDoublers += 1000
            account.gems -= 50
            await database.replaceValue(account.lowID, 'tokensDoublers', account.tokensDoublers);
            await database.replaceValue(account.lowID, 'gems', account.gems);
        }
    }}

module.exports = LogicPurchaseDoubleCoinsCommand