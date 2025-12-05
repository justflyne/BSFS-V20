const PiranhaMessage = require('../../PiranhaMessage');
const ByteStream = require("../../../ByteStream");
const database = require("../../../Database/DatabaseManager");
const Cards = require("../../../Assets/Cards");

class LogicBoxCommand extends PiranhaMessage {
    constructor(session, box, account, count = 1, isClaim = false) {
        super(session);
        this.id = 24111;
        this.session = session;
        this.version = 1;
        this.stream = new ByteStream();
        this.account = account;
        this.box = box;
        this.items = [];
        this.count = count;
        this.isClaim = isClaim;
        this.excludedIds = [36, 35, 33];
    }

    dropSPG(chance) {
        if (this.BrawlerOf9LVL.length <= 0) return false;
        if (Math.floor(Math.random() * 100) > chance) return false;

        const brawler = this.BrawlerOf9LVL[Math.floor(Math.random() * this.BrawlerOf9LVL.length)];
        const skills = global.Cards.getBrawlerSkills(4, brawler.id);

        for (const starPowers of skills) {
            if (!this.account.skills.includes(starPowers)) {
                this.account.skills.push(starPowers);
                database.replaceValue(this.account.lowID, 'skills', this.account.skills);
                return {
                    newItem: { type: 4, amount: 1, brawler: starPowers },
                    brawlerDrop: true
                };
            }
        }
        return false;
    }

    dropBrawler(blockedBrawlers, blockB, chance) {
        if (blockedBrawlers.length <= 0) return { brawlerDrop: false };
        if (Math.floor(Math.random() * 100) >= chance) return { brawlerDrop: false };

        const brawler = blockedBrawlers[Math.floor(Math.random() * blockedBrawlers.length)];
        if (brawler.unlocked || blockB.includes(brawler.id)) {
            return { brawlerDrop: false };
        }

        brawler.unlocked = true;
        database.replaceValue(this.account.lowID, 'brawlers', this.account.brawlers);
        return {
            newItem: { type: 1, csvType: 16, ammount: 1, brawler: brawler.id },
            brawlerDrop: true
        };
    }

    generateItems() {
        const newItem = [];
        const blockB = [...global.ListAwards.Brawlers.Amount, ...this.excludedIds];

        const unlockedBrawlers = this.account.brawlers.filter(
            b => b.unlocked && b.level < 8 && b.points < 1440 && !this.excludedIds.includes(b.id)
        );
        const blockedBrawlers = this.account.brawlers.filter(
            b => !b.unlocked && !blockB.includes(b.id)
        );
        const BrawlerOf9LVL = this.account.brawlers.filter(
            b => b.level >= 8 && !this.excludedIds.includes(b.id)
        );

        this.BrawlerOf9LVL = BrawlerOf9LVL;
        this.blockB = blockB;

        let gold, randomcount, brawlerPoints, brawlerId, targetBrawler, dropResult;

        switch (this.box) {
            case 10: {
                dropResult = this.dropBrawler(blockedBrawlers, blockB, 95);
                if (dropResult.brawlerDrop) {
                    newItem.push(dropResult.newItem);
                } else {
                    gold = Math.floor(Math.random() * 55 + 21);
                    newItem.push({ type: 7, ammount: gold });

                    randomcount = Math.floor(Math.random() * 3);
                    const availableBrawlers = [...unlockedBrawlers];
                    for (let i = 0; i < randomcount && availableBrawlers.length > 0; i++) {
                        const idx = Math.floor(Math.random() * availableBrawlers.length);
                        brawlerId = availableBrawlers[idx].id;
                        availableBrawlers.splice(idx, 1);

                        brawlerPoints = Math.floor(Math.random() * 55 + 32);
                        targetBrawler = this.account.brawlers.find(b => b.id === brawlerId);
                        targetBrawler.points += brawlerPoints;
                        newItem.push({ type: 6, csvType: 16, ammount: brawlerPoints, brawler: brawlerId });
                    }

                    const spgDrop = this.dropSPG(85);
                    if (spgDrop) newItem.push(spgDrop.newItem);

                    if (Math.floor(Math.random() * 100) >= 90) {
                        newItem.push({ type: 8, ammount: Math.floor(gold / 15) });
                    }
                }
                break;
            }

            case 11: {
                gold = Math.floor(Math.random() * (480 - 120) + 120);
                newItem.push({ type: 7, ammount: gold });

                randomcount = Math.floor(Math.random() * 4) + 3;
                const availableBrawlers = [...unlockedBrawlers];
                for (let i = 0; i < randomcount && availableBrawlers.length > 0; i++) {
                    const idx = Math.floor(Math.random() * availableBrawlers.length);
                    brawlerId = availableBrawlers[idx].id;
                    availableBrawlers.splice(idx, 1);

                    brawlerPoints = Math.floor(Math.random() * 55 + 144);
                    targetBrawler = this.account.brawlers.find(b => b.id === brawlerId);
                    targetBrawler.points += brawlerPoints;
                    newItem.push({ type: 6, csvType: 16, ammount: brawlerPoints, brawler: brawlerId });
                }

                const spgDrop = this.dropSPG(85);
                if (spgDrop) newItem.push(spgDrop.newItem);

                if (randomcount >= 5) {
                    dropResult = this.dropBrawler(blockedBrawlers, blockB, 0);
                    if (dropResult.brawlerDrop) {
                        newItem.push(dropResult.newItem);
                    } else {
                        const spgDrop2 = this.dropSPG(70);
                        if (spgDrop2) newItem.push(spgDrop2.newItem);
                    }
                } else if (Math.floor(Math.random() * 100) >= 60) {
                    newItem.push({ type: 8, ammount: Math.floor(gold / 14) });
                }
                break;
            }

            case 12: {
                gold = Math.floor(Math.random() * 68 + 27);
                newItem.push({ type: 7, ammount: gold });

                randomcount = Math.floor(Math.random() * 2) + 3;
                const availableBrawlers = [...unlockedBrawlers];
                for (let i = 0; i < randomcount && availableBrawlers.length > 0; i++) {
                    const idx = Math.floor(Math.random() * availableBrawlers.length);
                    brawlerId = availableBrawlers[idx].id;
                    availableBrawlers.splice(idx, 1);

                    brawlerPoints = Math.floor(Math.random() * 55 + 65);
                    targetBrawler = this.account.brawlers.find(b => b.id === brawlerId);
                    targetBrawler.points += brawlerPoints;
                    newItem.push({ type: 6, csvType: 16, ammount: brawlerPoints, brawler: brawlerId });
                }

                dropResult = this.dropBrawler(blockedBrawlers, blockB, 90);
                if (dropResult.brawlerDrop) {
                    newItem.push(dropResult.newItem);
                } else {
                    const spgDrop = this.dropSPG(85);
                    if (spgDrop) newItem.push(spgDrop.newItem);
                }

                if (Math.floor(Math.random() * 100) >= 80) {
                    newItem.push({ type: 8, ammount: Math.floor(gold / 15) });
                }
                break;
            }
        }

        database.replaceValue(this.account.lowID, 'brawlers', this.account.brawlers);
        this.items.push(...newItem);
        return newItem;
    }

    async encode() {
        this.stream.writeVInt(203);
        this.stream.writeVInt(1);
        this.stream.writeVInt(this.count);

        for (let i = 0; i < this.count; i++) {
            const items = this.generateItems();
            this.stream.writeVInt(this.box);
            this.stream.writeVInt(items.length);
            for (const item of items) {
                this.stream.writeVInt(item.ammount);
                this.stream.writeDataReference(item.csvType || 0, item.brawler);
                this.stream.writeVInt(item.type);
                this.stream.writeVInt(0);
                this.stream.writeDataReference(item.type === 4 ? 23 : 0, item.brawler);
                this.stream.writeVInt(0);

                if (item.type === 7) this.account.currencies.gold += item.ammount;
                if (item.type === 8) this.account.currencies.gems += item.ammount;
            }
        }

        if (this.isClaim) {
            this.stream.writeVInt(this.account.trophyRoadProgress + 1);
        } else {
            for (let i = 0; i < 13; i++) {
                this.stream.writeVInt(0);
            }
        }

        await database.replaceValue(this.account.lowID, 'currencies', this.account.currencies);
    }
}

module.exports = LogicBoxCommand;