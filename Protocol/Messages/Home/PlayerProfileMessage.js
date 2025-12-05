const fs = require('fs');
const PiranhaMessage = require('../../PiranhaMessage')
const ByteStream = require("../../../ByteStream")
const PlayerDisplayData = require('../../../Logic/PlayerDisplayData');
const Player = new PlayerDisplayData();

class PlayerProfileMessage extends PiranhaMessage {
  constructor(session, account) {
    super(session);
    this.id = 24113;
    this.session = session;
    this.version = 0;
    this.account = account;
    //this.club = club
    this.stream = new ByteStream();
  }

  async encode() {
    this.stream.writeLogicLong(0, this.account.lowID)
    this.stream.writeVInt(0)

    const countBrawlers = this.account.brawlers;
    const unlockedBrawlers = countBrawlers.filter(brawler => brawler.unlocked === true);
    const unlockedCount = unlockedBrawlers.length;

    this.stream.writeVInt(unlockedCount);
    for (const brawler of unlockedBrawlers) {
        this.stream.writeDataReference(16, brawler.id);
        this.stream.writeVInt(0);
        this.stream.writeVInt(brawler.trophies);
        this.stream.writeVInt(brawler.trophies);
        this.stream.writeVInt(brawler.level);
    }
    this.stream.writeVInt(14)
    this.stream.writeLogicLong(1, this.account.trioWins) // 3vs3 wins
    this.stream.writeLogicLong(2, this.account.experience) // exp
    this.stream.writeLogicLong(3, this.account.trophies) // trophies
    this.stream.writeLogicLong(4, this.account.highestTrophies) // hightrophies
    this.stream.writeLogicLong(5, 1) // brawlersAmount
    this.stream.writeLogicLong(6, 1) // idk
    this.stream.writeLogicLong(7, 1)  // Something.
    this.stream.writeLogicLong(8, this.account.soloWins) // Solo wins
    this.stream.writeLogicLong(9, 9339) // RoboRumble time
    this.stream.writeLogicLong(10, 9339) // BigBrawler time
    this.stream.writeLogicLong(11, this.account.duoWins) // Duo wins
    this.stream.writeLogicLong(12, 9339) // Passed level BossFight
    this.stream.writeLogicLong(13, 0)//9999
    this.stream.writeLogicLong(14, 0) // Best place in power play
    
    Player.PlayerDisplayData(this.stream, this.account.name, this.account.thumbnail, this.account.nameColor);

    /*if (this.club !== null){
      this.stream.writeBoolean(false) // alliance
      this.stream.writeInt(0)
      this.stream.writeInt(0)
      this.stream.writeString(0)  // club name
      this.stream.writeDataReference(8, 1); // BadgeID type
      this.stream.writeVInt(this.club.Type)  // club type | 1 = Open, 2 = invite only, 3 = closed
      this.stream.writeVInt(0) // Current members count
      this.stream.writeVInt(0)
      this.stream.writeVInt(0)  // Trophy required
      this.stream.writeVInt(0)  // (Unknown)
      this.stream.writeString("BS")  // region
      this.stream.writeVInt(0)  // (Unknown)
      this.stream.writeDataReference(25, this.account.ClubRole);
    }else{
      this.stream.writeVInt(0)
      this.stream.writeVInt(0)
    }*/
  }
}

module.exports = PlayerProfileMessage;