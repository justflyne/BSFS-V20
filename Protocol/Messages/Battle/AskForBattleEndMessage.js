const PiranhaMessage = require('../../PiranhaMessage')
const ByteStream = require("../../../ByteStream")
const database = require("../../../Database/DatabaseManager")
const BattleEndMessage = require('./BattleEndMessage');
const fs = require('fs').promises;

class AskForBattleEndMessage extends PiranhaMessage {
  constructor(bytes, session) {
    super(session);
    this.session = session;
    this.id = 14110;
    this.version = 0;
    this.stream = new ByteStream(bytes);
    this.nicknames = ["t.me/projectbsfs", "projectbsfs.t.me", "@projectbsfs", "BSFS Bot", "justflyne"];

  }

  async decode() {
    this.battleResult = this.stream.readVInt();
    this.stream.readVInt();
    this.rank = this.stream.readVInt();
    this.mapId = this.stream.readDataReference()[1];
    this.playersAmount = this.stream.readVInt();
    this.fields = [];
    this.stream.readVInt(); // Brawler CsvID
    this.stream.readVInt(); // Selected Brawler
    this.stream.readVInt(); // Skin CsvID
    this.stream.readVInt(); // Selected Skin
    this.stream.readVInt(); 
    this.stream.readVInt();
    this.playerName = this.stream.readString()// your name

    for (let j = 1; j < this.playersAmount; j++) {
      this.filds = {}

      const k = Math.floor(Math.random() * this.nicknames.length);
      this.filds.name = this.nicknames[k];
      this.nicknames.splice(k, 0x1);

      this.stream.readVInt();
      this.filds.brawlerId = this.stream.readVInt();
      this.filds.skinId = this.stream.readVInt();
      if(this.fields.length >= 2){
        this.filds.Team = 1;
        this.stream.readVInt();
      }else{
        this.filds.Team = this.stream.readVInt();
      }
      this.stream.readVInt(); //Unknown
      this.stream.readString() //Name
      this.fields.push(this.filds)
    }
  }

  async process() {
    this.session.trophiesGained = 0;
    this.session.tokensGained = 0;
    const account = await database.getAccount(this.session.lowID);
    const d = new Date(account.lastGame);
    const e = new Date();
    const f = e - d;
    if (f <= 20000 || account.status !== 8 || this.playerName !== account.name) {
      return;
    }
    var game = (this.playersAmount === 10 && this.fields[0].Team === 0) ? 5 : (this.playersAmount === 6 ? 1 : (this.playersAmount === 10 ? 2 : game));        
    new BattleEndMessage(this.session, this.battleResult, this.fields, this.rank, account, game, this.mapId).send();
    await database.replaceValue(this.session.lowID, "lastGame", new Date());
  }
}

module.exports = AskForBattleEndMessage;