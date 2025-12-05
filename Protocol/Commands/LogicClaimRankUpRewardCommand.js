const PiranhaMessage = require('../PiranhaMessage')
const ByteStream = require("../../ByteStream")
const database = require("../../Database/DatabaseManager")
const GatchaDrop = require('../../Logic/GatchaDrop')
const LogicBoxCommand = require('../Messages/Home/LogicBoxCommand')
const milestones = require('../../Assets/milestones')
const fs = require('fs')

class LogicClaimRankUpRewardCommand extends PiranhaMessage {
    constructor(bytes, session) {
        super(bytes);
        this.session = session;
        this.commandID = 517;
        this.version = 0;
        this.stream = new ByteStream(bytes);
    }

    decode() {
        for (let i = 0; i < 10; i++) {
            this.stream.readVInt();
        }
        this.Brawler = this.stream.readVInt();
    }

    lookupRewardValue(indexes, amounts, level) {
        const idx = indexes.indexOf(level);
        return idx !== -1 ? amounts[idx] : null;
    }

    async handleReward(type, account) {
        const config = global.ListAwards[type];
        if (!config || !config.Indexes.includes(this.Level)) return;

        const amount = this.lookupRewardValue(config.Indexes, config.Amount, this.Level);
        const session = this.session;

        switch (type) {
            case 'Gold':
                new GatchaDrop(session, 100, 7, amount, -1, this.Level + 1).send();
                session.currencies.gold += amount;
                await database.replaceValue(account.lowID, 'currencies', session.currencies);
                break;

            case 'TokenDoubler':
                new GatchaDrop(session, 100, 2, amount, -1, this.Level + 1).send();
                session.currencies.tokensDoublers += amount;
                await database.replaceValue(account.lowID, 'currencies', session.currencies);
                break;

            case 'Tickets':
                new GatchaDrop(session, 100, 3, amount, -1, this.Level + 1).send();
                session.currencies.tickets += amount;
                await database.replaceValue(account.lowID, 'currencies', session.currencies);
                break;

            case 'PowerPoints':
                new GatchaDrop(session, 100, 6, amount, this.Brawler, this.Level + 1).send();
                const brawler = account.brawlers.find(b => b.id === this.Brawler);
                if (brawler) {
                    brawler.points += amount;
                    await database.replaceValue(account.lowID, 'brawlers', account.brawlers);
                }
                break;

            case 'Box':
                new LogicBoxCommand(session, 10, account, 1, true).send();
                break;

            case 'BigBox':
                new LogicBoxCommand(session, 12, account, 1, true).send();
                break;

            case 'MegaBox':
                new LogicBoxCommand(session, 11, account, 1, true).send();
                break;

            case 'Brawlers':
                const characterId = amount;
                const targetBrawler = account.brawlers.find(b => b.id === characterId);
                if (targetBrawler && !targetBrawler.unlocked) {
                    targetBrawler.unlocked = true;
                    new GatchaDrop(session, 100, 1, 1, characterId, this.Level + 1).send();
                    await database.replaceValue(account.lowID, 'brawlers', account.brawlers);
                } else {
                    new LogicBoxCommand(session, 10, account, 1, true).send();
                }
                break;            
        }
    }

    async process() {
        const account = await database.getAccount(this.session.lowID);
        if (!account) return;

        this.session.currencies = account.currencies;
        const requiredTrophies = milestones.findProgress(account.trophyRoadProgress - 1);
        if (account.trophies < requiredTrophies) {
            return;
        }

        this.Level = account.trophyRoadProgress - 1;

        const rewardTypes = [
            'Gold',
            'Box',
            'BigBox',
            'MegaBox',
            'TokenDoubler',
            'PowerPoints',
            'Tickets',
            'Brawlers'
        ];

        for (const type of rewardTypes) {
            await this.handleReward(type, account);
        }

        await database.replaceValue(account.lowID, 'trophyRoadProgress', account.trophyRoadProgress + 1);
    }
}

module.exports = LogicClaimRankUpRewardCommand;