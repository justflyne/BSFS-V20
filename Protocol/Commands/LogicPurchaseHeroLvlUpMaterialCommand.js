const PiranhaMessage = require('../PiranhaMessage')
const ByteStream = require("../../ByteStream")
const database = require("../../Database/DatabaseManager")
const OutOfSyncMessage = require('../Messages/Account/OutOfSyncMessage')
const fs = require('fs');

class LogicPurchaseHeroLvlUpMaterialCommand extends PiranhaMessage {
    constructor(bytes, session) {
        super(bytes)
        this.session = session;
        this.commandID = 521
        this.version = 0        
        this.stream = new ByteStream(bytes);
    }

    decode(self) {
        for (let i = 0; i < 9; i++) {
            this.stream.readVInt();
        }
        this.goldType = this.stream.readVInt()
    }

    async process() {
        const goldValues = {
            0: { gold: 150, gems: 20 },
            1: { gold: 400, gems: 50 },
            2: { gold: 1200, gems: 140 },
            3: { gold: 2600, gems: 280 }
        };
    
        const account = await database.getAccount(this.session.lowID);
        if (account.gems-goldValues[this.goldType] < 0) {
            return new OutOfSyncMessage(this.session).send();
        }
        else {
            const { gold, gems } = goldValues[this.goldType];
            account.gems -= gems
            account.gold += gold
            await database.replaceValue(account.lowID, 'gems', account.gems);
            await database.replaceValue(account.lowID, 'gold', account.gold);
        }
    }
    
}

module.exports = LogicPurchaseHeroLvlUpMaterialCommand