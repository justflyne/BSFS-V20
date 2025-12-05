const PiranhaMessage = require('../PiranhaMessage')
const ByteStream = require("../../ByteStream")
const database = require("../../Database/DatabaseManager")
const shop = require('../../Logic/Shop');
const LogicBoxCommand = require('../Messages/Home/LogicBoxCommand');
const LogicShopCommand = require('../Messages/Home/LogicShopCommand');
const OutOfSyncMessage = require('../Messages/Account/OutOfSyncMessage');
const myShop = new shop();

class LogicPurchaseOfferCommand extends PiranhaMessage {
    constructor(bytes, session) {
        super(bytes);
        this.session = session;
        this.commandID = 519;
        this.version = 0;
        this.stream = new ByteStream(bytes);
    }

    decode() {
        for (let i = 0; i < 9; i++) {
            this.stream.readVInt();
        }
        this.offerId = this.stream.readVInt();
    }

    async process() {
        const account = await database.getAccount(this.session.lowID) 
        const foundOffer = myShop.findItemByIndex(this.offerId, account.shop);

        if (!foundOffer.claim){
            const includesArray = foundOffer.includes;
            var cost = foundOffer.cost;
            const { gems, gold, starpoints } = account.currencies;
            switch (foundOffer.type) {
                case 0:
                    if (gems >= cost) account.currencies.gems -= cost;
                    break;
                case 1:
                    if (gold >= cost) account.currencies.gold -= cost;
                    break;
                case 2:
                    if (starpoints >= cost) account.currencies.starpoints -= cost;
                    break;
                default:
                    return new OutOfSyncMessage(this.session).send();
            }

            if (includesArray.find(item => item.id === 6)) {
                new LogicBoxCommand(this.session, 10, account, includesArray[0].multiplier).send()
            }
            else if (includesArray.find(item => item.id === 10)) {
                new LogicBoxCommand(this.session, 11, account, includesArray[0].multiplier).send()
            }
            else if (includesArray.find(item => item.id === 14)) {
                new LogicBoxCommand(this.session, 12, account, includesArray[0]. multiplier).send()
            }
            else {
                new LogicShopCommand(this.session, account, includesArray).send()
            }
            foundOffer.claim = true

            await database.replaceValue(account.lowID, 'shop', account.shop);
        }
    }
}

module.exports = LogicPurchaseOfferCommand;