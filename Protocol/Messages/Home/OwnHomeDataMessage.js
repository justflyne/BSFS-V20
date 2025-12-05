const PiranhaMessage = require('../../PiranhaMessage')
const ByteStream = require("../../../ByteStream")
const Shop = require("../../../Logic/Shop")

class OwnHomeDataMessage extends PiranhaMessage {
  constructor (session, account) {
    super(session)
    this.id = 24101
    this.session = session
    this.account = account
    this.version = 0
    this.stream = new ByteStream()
  }

  async encode () {    
    // LogicDailyData Start    
    
    this.stream.writeVInt(0)
    this.stream.writeVInt(0)

    this.stream.writeVInt(this.account.trophies)
    this.stream.writeVInt(this.account.highestTrophies)

    this.stream.writeVInt(0)
    this.stream.writeVInt(this.account.trophyRoadProgress)

    this.stream.writeVInt(this.account.experience) //Experience

    this.stream.writeDataReference(28, this.account.thumbnail)
    this.stream.writeDataReference(43, this.account.nameColor)

    this.stream.writeVInt(0) // PlayedGamemodesArray

    this.stream.writeVInt(1) // SelectedSkins
    this.stream.writeDataReference(29, this.account.skinId)
	this.session.skinId = this.account.skinId;
    this.stream.writeVInt(this.account.skins.length || 0) // UnlockedSkins
    for(let skin of this.account.skins || []){
        this.stream.writeDataReference(29, skin)
    }

    this.stream.writeVInt(0)
    this.stream.writeVInt(this.account.trophies)
    this.stream.writeVInt(0)

    this.stream.writeBoolean(false)
    this.stream.writeVInt(1)
    this.stream.writeBoolean(true)

    this.stream.writeVInt(this.account.currencies.tokensDoublers)
    this.stream.writeVInt(3600);

    this.stream.writeByte(8) 
    this.stream.writeBoolean(false)
    this.stream.writeBoolean(false)
    this.stream.writeBoolean(false)
    this.stream.writeVInt(0)
    this.stream.writeVInt(0)

    new Shop().encode(this.stream, this.account) // encode shop
    
    this.stream.writeVInt(0) // AdsArray

    this.stream.writeVInt(200) // BattleTokens
    this.stream.writeVInt(0)

    this.stream.writeVInt(0)

    this.stream.writeVInt(this.account.currencies.tickets) // Tickets
    this.stream.writeVInt(0)
    this.session.brawlerId = this.account.brawlerId;
    this.stream.writeDataReference(16, this.session.brawlerId)

    this.stream.writeString("RU")
    this.stream.writeString("t.me/projectbsfs")//authorCode


    this.stream.writeVInt(5) // count
    {
        this.stream.writeLong(3, this.session.tokensGained) // token reward
        this.stream.writeLong(4, this.session.trophiesGained) // trophies reward
        this.stream.writeLong(5, this.session.starToken) // idk
        this.stream.writeLong(6, 0) // demo account
        this.stream.writeLong(7, 0) // do not disturb
    }        
    this.stream.writeVInt(0) // IntValueArray
    
    // LogicDailyData End
    // LogicConfData Start

    this.stream.writeVInt(2019049)
    this.stream.writeVInt(100)
    this.stream.writeVInt(10)        

    this.stream.writeLogicLong(30, 3)

    this.stream.writeLogicLong(80, 10)

    this.stream.writeLogicLong(50, 1000)

    this.stream.writeVInt(550) // minimum brawler trophies for season reset
    this.stream.writeVInt(50) // brawler trophy loss percentage in season reset
    this.stream.writeVInt(999900)

    this.stream.writeVInt(0) // Array

    const Eventes =[{
        reward: 20,
        slotid: 0,
        id: 24,
        timer: 3600,
        Ended: false,
        tokensclaimed: []
      },
      {
        reward: 20,
        slotid: 1,
        id: 14,
        timer: 3600,
        Ended: false,
        tokensclaimed: []
      },
      {
        reward: 20,
        slotid: 2,
        id: 0,
        timer: 3600,
        Ended: false,
        tokensclaimed: []
      },
      {
        reward: 20,
        slotid: 3,
        id: 24,
        timer: 3600,
        Ended: false,
        tokensclaimed: []
      }
    ]
    this.stream.writeVInt(Eventes.length+1)  // array
    for (let i = 0; i < Eventes.length+1; i++){
        this.stream.writeVInt(i)
    }

    this.stream.writeVInt(Eventes.length)
    for (const map of Eventes) {
      this.stream.writeVInt(Eventes.indexOf(map) + 1)
      this.stream.writeVInt(Eventes.indexOf(map) + 1)
      this.stream.writeBoolean(map.Ended)
      this.stream.writeVInt(map.timer) // timer

      this.stream.writeVInt(map.reward) // tokens
      this.stream.writeDataReference(15, map.id)

      this.stream.writeVInt(1)//Used

      this.stream.writeString()
      this.stream.writeVInt(0)
      this.stream.writeBoolean(false)
      this.stream.writeVInt(0)
    }

    this.stream.writeVInt(0) // Coming events array

    this.stream.writeVInt(8)
    for (const i of [20, 35, 75, 140, 290, 480, 800, 1250]) {
      this.stream.writeVInt(i)
    }

    this.stream.writeVInt(8)
    for (const i of [1, 2, 3, 4, 5, 10, 15, 20]) {
      this.stream.writeVInt(i)
    }

    this.stream.writeVInt(3)
    for (const i of [10, 30, 80]) {
      this.stream.writeVInt(i)
    }

    this.stream.writeVInt(3)
    for (const i of [6, 20, 60]) {
      this.stream.writeVInt(i)
    }

    this.stream.writeVInt(4)
    for (const i of [20, 50, 140, 280]) {
      this.stream.writeVInt(i)
    }

    this.stream.writeVInt(4)
    for (const i of [150, 400, 1200, 2600]) {
      this.stream.writeVInt(i)
    }

    this.stream.writeVInt(0)
    this.stream.writeVInt(200) // Max tokens
    this.stream.writeVInt(20)

    this.stream.writeVInt(8640)
    this.stream.writeVInt(10)
    this.stream.writeVInt(5)
    this.stream.writeVInt(6)
    this.stream.writeVInt(50)
    this.stream.writeVInt(604800)
    
    this.stream.writeBoolean(true)

    this.stream.writeVInt(0) // ReleaseEntry

    this.stream.writeVInt(7) // count
    {
        this.stream.writeLong(1, 41000000 + 7); // theme
        this.stream.writeLong(3, 0) // required lvl for unlock friendly games
        this.stream.writeLong(5, 0) // disable shop
        this.stream.writeLong(6, 0) // disable boxes
        this.stream.writeLong(14, 0) // event token doublers
        this.stream.writeLong(15, 0) // disable content creator in shop
        this.stream.writeLong(16, 1) // disable video in the news
    }
    
    // LogicConfData End

    this.stream.writeLong(0, this.account.lowID)
    
    this.stream.writeVInt(1) // NotificationID

    this.stream.writeVInt(81) // NotificationID
    this.stream.writeInt(1) // NotificattitonIndex
    this.stream.writeBoolean(false) // isSeen
    this.stream.writeInt(0) // Time ago was received
    this.stream.writeString(`BSFS V20 Started!`) // Message
    this.stream.writeVInt(0) // sentBy (0 - Tech. Support, 1 - System)

    this.stream.writeBoolean(true)

    this.stream.writeLogicLong(0, 0)
    this.stream.writeLogicLong(0, this.session.lowID)
    this.stream.writeLogicLong(0, 0)
    this.stream.writeLogicLong(0, 0)

    this.stream.writeString(this.account.name)
    this.stream.writeVInt(this.account.name !== "BSFS V20" ? 1 : 0);


    this.stream.writeString()

    this.stream.writeVInt(8)

    this.stream.writeVInt(this.account.brawlers.length + 4)

    for (const brawler of this.account.brawlers) {
      this.stream.writeDataReference(23, brawler.cardID)
      this.stream.writeVInt(brawler.unlocked ? 1 : 0)
    }


    this.stream.writeDataReference(5, 1)
    this.stream.writeVInt(this.account.currencies.tokens) // Small Box tokens

    this.stream.writeDataReference(5, 8)
    this.stream.writeVInt(this.account.currencies.gold) // Gold

    this.stream.writeDataReference(5, 9)
    this.stream.writeVInt(this.account.currencies.starTokens) // Big Box tokens

    this.stream.writeDataReference(5, 10)
    this.stream.writeVInt(this.account.currencies.starpoints) // StarPoints
    this.stream.writeVInt(this.account.brawlers.length)
    for (const brawler of this.account.brawlers) {
      this.stream.writeDataReference(16, brawler.id)
      this.stream.writeVInt(brawler.trophies)
    }

    this.stream.writeVInt(this.account.brawlers.length)
    for (const brawler of this.account.brawlers) {
      this.stream.writeDataReference(16, brawler.id)
      this.stream.writeVInt(brawler.trophies)
    }

    this.stream.writeVInt(0) // UnknownArray

    this.stream.writeVInt(this.account.brawlers.length)
    for (const brawler of this.account.brawlers) {
      this.stream.writeDataReference(16, brawler.id)
      this.stream.writeVInt(brawler.points)
    }

    this.stream.writeVInt(this.account.brawlers.length)
    for (const brawler of this.account.brawlers) {
      this.stream.writeDataReference(16, brawler.id)
      this.stream.writeVInt(brawler.level)
    }

    this.stream.writeVInt(global.skills.length)
    for(let skill of global.skills){
      this.stream.writeDataReference(23, skill)
      if (this.account.skills.includes(skill)){
        this.stream.writeVInt(this.session.starPowers === skill ? 2 : 1)
      }else{
        this.stream.writeVInt(0)
      }
    }

    this.stream.writeVInt(0)

    this.stream.writeVInt(this.account.currencies.gems)
    this.stream.writeVInt(this.account.currencies.gems)
    this.stream.writeVInt(1)//Player Experience Level
    this.stream.writeVInt(100)
    this.stream.writeVInt(0)//Cumulative Purchased Gems
    this.stream.writeVInt(0)//Battles Count
    this.stream.writeVInt(0)//Win Count
    this.stream.writeVInt(0)//Lose Count
    this.stream.writeVInt(0)//Win/Loose Streak
    this.stream.writeVInt(0)//Npc Win Count
    this.stream.writeVInt(0)//Npc Lose Count
    this.stream.writeVInt(2)//Tutorial State
    this.stream.writeVInt(1585502369)
    
    this.session.tokensGained = 0;
    this.session.trophiesGained = 0;
  }
}

module.exports = OwnHomeDataMessage
