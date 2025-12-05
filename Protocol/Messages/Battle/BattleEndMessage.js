const PiranhaMessage = require('../../PiranhaMessage')
const ByteStream = require("../../../ByteStream")
const database = require("../../../Database/DatabaseManager")
const PlayerDisplayData = require('../../../Logic/PlayerDisplayData');
const {
  calculateShowdown,
  calculateDuoShowdown,
  calculateGemGrab
} = require("../../../Logic/CalculateTrophies");
class BattleEndMessage extends PiranhaMessage {
  constructor(session, battleResult, playerArray, rank, account, game, mapId) {
    super(session);
    this.id = 0x5ba0;
    this.session = session;
    this.version = 0x1;
    this.battleResult = battleResult;
    this.playerArray = playerArray;
    this.rank = rank;
    this.account = account;
    this.game = game;    
    this.mapId = mapId
    this.stream = new ByteStream();
    this.newTokensDoublerValue = 0x0;
  }
  
  async encode() {
    const PlayerData = new PlayerDisplayData();
    const Brawler = this.account.brawlers.find(brawler => brawler.id === this.session.brawlerId);
    if (this.game === 1) {//3x3
      this.session.tokensGained += Math.floor(Math.random() * 50);
      this.session.trophiesGained = calculateGemGrab(Math.round(Brawler.trophies), this.battleResult);
    } else if (this.game === 5){
      this.session.tokensGained += Math.floor(Math.random() * 60);
      this.session.trophiesGained = calculateDuoShowdown(Math.round(Brawler.trophies), this.rank);
    } else if (this.game === 2) {//Showdown
      this.session.tokensGained += Math.floor(Math.random() * 40);
      this.session.trophiesGained = calculateShowdown(Math.round(Brawler.trophies), this.rank);
    }
	if (this.session.trophiesGained === null) this.session.trophiesGained = 0;
	if (this.session.trophiesGained === undefined) this.session.trophiesGained = 0;
    
    this.stream.writeVInt(this.game);
    this.stream.writeVInt((this.game === 2 || this.game === 5) ? this.rank : this.battle_result);
    this.stream.writeVInt(this.session.tokensGained);
    this.stream.writeVInt(this.session.trophiesGained);

    if (this.account.currencies.tokensDoublers > 0) {
      let TokensDoubler = this.account.currencies.tokensDoublers;
      let cacult2 = TokensDoubler - this.session.tokensGained;
      let cacult3 = Math.max(0, TokensDoubler - cacult2);
      this.stream.writeVInt(cacult3);
      this.stream.writeVInt(0);
      this.stream.writeVInt(Math.max(0, this.account.currencies.tokensDoublers - this.session.tokensGained));
      this.newTokensDoublerValue = Math.max(0, this.account.currencies.tokensDoublers - this.session.tokensGained);
      this.session.tokensGained = this.session.tokensGained + cacult3;
    } else {
      this.stream.writeVInt(0);
      this.stream.writeVInt(0);
      this.stream.writeVInt(0);
    }

    this.stream.writeVInt(0); //Big Game/Robo Rumble Time and Boss Fight Level Cleared
    this.stream.writeVInt(16);//Championship Level Passed
    const ingame = this.game === 5 ? 1 : this.playerArray.length

    this.stream.writeVInt(1 + ingame);//Battle End Screen Players
    
    this.stream.writeVInt(1);// Player Team and Star Player Type
    this.stream.writeDataReference(16, this.session.brawlerId);
    this.stream.writeDataReference(29, this.session.skinId);
    this.stream.writeVInt(Brawler.trophies)
    this.stream.writeVInt(Brawler.level + 1); // хз ебать
    this.stream.writeBoolean(true);// Player HighID and LowID Array
    this.stream.writeInt(0);// HighID
    this.stream.writeInt(this.account.lowID);// LowID

    PlayerData.PlayerDisplayData(this.stream, this.account.name, this.account.thumbnail, this.account.nameColor)
    for (let i = 0; i < ingame; i++) {
      this.stream.writeVInt(this.playerArray[i]['Team'] === 1 ? 2 : 0);// Player Team and Star Player Type

      this.stream.writeDataReference(16, this.playerArray[i]['brawlerId']);
      this.stream.writeVInt(this.playerArray[i]['skinId']);
      this.stream.writeVInt(Brawler.trophies * 0.50);// Brawler Trophies
      this.stream.writeVInt(Brawler.level); // brawler lvl
      this.stream.writeBoolean(false);// Player HighID and LowID Array
      PlayerData.PlayerDisplayData(this.stream, this.playerArray[i]['name'], 0, 0)
    }

    // # Experience Entry Array
    this.stream.writeVInt(1) //# Count
    let experience = Math.floor(Math.random() * 40);
    this.stream.writeVInt(this.battleResult)
    this.stream.writeVInt(experience)
    // # Experience Entry Array End
    this.stream.writeVInt(0) // Milestones Count

    this.stream.writeVInt(2);
    this.stream.writeVInt(1)
    this.stream.writeVInt(Brawler.trophies)
    this.stream.writeVInt(Brawler.trophies)
    this.stream.writeVInt(5)
    this.stream.writeVInt(this.account.experience - experience)// 
    this.stream.writeVInt(this.account.experience - experience)

    this.stream.writeDataReference(28, 0);
    this.stream.writeBoolean(false);

    Brawler.trophies = Math.round(Brawler.trophies) + this.session.trophiesGained

    this.account.currencies.tokens += this.session.tokensGained
    this.account.currencies.tokensDoublers = this.newTokensDoublerValue


    if (this.session.trophiesGained > 0) {
      this.session.starToken += 1
      this.account.currencies.starTokens += this.session.starToken
      if (this.game === 2) {
        this.account.wins.soloWins += 1
      } else if(this.game === 5){
        this.account.wins.duoWins += 1
      } else {
        this.account.wins.trioWins += 1
      }
      await database.replaceValue(this.account.lowID, 'wins', this.account.wins)
    }
    await database.replaceValue(this.account.lowID, 'currencies', this.account.currencies);
    await database.replaceValue(this.account.lowID, 'brawlers', this.account.brawlers)
    await database.replaceValue(this.account.lowID, 'experience', this.account.experience+experience)
  }
}

module.exports = BattleEndMessage;