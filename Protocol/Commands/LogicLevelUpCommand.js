const PiranhaMessage = require('../PiranhaMessage')
const ByteStream = require("../../ByteStream")
const database = require("../../Database/DatabaseManager")
const OutOfSyncMessage = require('../Messages/Account/OutOfSyncMessage')

class LogicLevelUpCommand extends PiranhaMessage {
    constructor(bytes, session) {
        super(bytes);
        this.session = session;
        this.commandID = 520;
        this.version = 0;
        this.stream = new ByteStream(bytes);
    }

    decode() {
        for (let i = 0; i < 10; i++) {
            this.stream.readVInt();
        }
        this.brawlerId = this.stream.readVInt();
    }

    async process() {

        function GetQuantityFromLevel(AllLevels, AllQuantities, ThisLevel) {
            return AllQuantities[AllLevels.indexOf(ThisLevel)];
        }

        const account = await database.getAccount(this.session.lowID);

        const targetBrawler = account.brawlers.find(brawler => brawler.id === this.brawlerId);
        if(targetBrawler.level > 7){
            return new OutOfSyncMessage(this.session).send();
        }
        const amount = GetQuantityFromLevel(
            [0, 1, 2, 3, 4, 5, 6, 7],
            [20, 35, 75, 140, 290, 480, 800, 1250],
            targetBrawler.level
        );
        targetBrawler.level += 1;
        account.currencies.gold -= amount;
        await Promise.all([
            database.replaceValue(account.lowID, 'brawlers', account.brawlers),
            database.replaceValue(account.lowID, 'currencies', account.currencies)
        ]);
    }
}

module.exports = LogicLevelUpCommand;