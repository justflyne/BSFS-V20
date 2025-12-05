const PiranhaMessage = require('../PiranhaMessage')
const ByteStream = require("../../ByteStream")
const database = require('../../Database/DatabaseManager');
const LogicBoxCommand = require('../Messages/Home/LogicBoxCommand');
const OutOfSyncMessage = require('../Messages/Account/OutOfSyncMessage');

class LogicGatchaCommand extends PiranhaMessage {
    constructor(bytes, session) {
        super(session);
        this.session = session;
        this.commandID = 500; // 0x1F4 = 500
        this.version = 0;
        this.stream = new ByteStream(bytes);
    }

    decode() {
        for (let i = 0; i < 9; i++) {
            this.stream.readVInt();
        }
        this.boxType = this.stream.readVInt();
    }

    async process() {
        const account = await database.getAccount(this.session.lowID);

        let boxId;

        switch (this.boxType) {
            case 5:
                if (account.currencies.tokens < 100) {
                    return new OutOfSyncMessage(this.session).send();
                }
                account.currencies.tokens -= 100;
                await database.replaceValue(account.lowID, 'currencies', account.currencies);
                boxId = 10;
                break;

            case 4:
                if (account.currencies.starTokens < 10) {
                    return new OutOfSyncMessage(this.session).send();
                }
                account.currencies.starTokens -= 10;
                await database.replaceValue(account.lowID, 'currencies', account.currencies);
                boxId = 12;
                break;

            case 3:
                if (account.currencies.gems < 80) {
                    return new OutOfSyncMessage(this.session).send();
                }
                account.currencies.gems -= 80;
                await database.replaceValue(account.lowID, 'currencies', account.currencies);
                boxId = 11;
                break;

            case 1:
                if (account.currencies.gems < 30) {
                    return new OutOfSyncMessage(this.session).send();
                }
                account.currencies.gems -= 30;
                await database.replaceValue(account.lowID, 'currencies', account.currencies);
                boxId = 12;
                break;

            default:
                return;
        }        
        new LogicBoxCommand(this.session, boxId, account).send();
    }
}

module.exports = LogicGatchaCommand;