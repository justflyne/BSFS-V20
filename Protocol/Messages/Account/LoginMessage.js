const PiranhaMessage = require('../../PiranhaMessage')
const ByteStream = require("../../../ByteStream")
const LoginOKMessage = require('./LoginOKMessage')
const LoginFailedMessage = require('./LoginFailedMessage')
const OwnHomeDataMessage = require('../Home/OwnHomeDataMessage')
const crypto = require('crypto');
const database = require("../../../Database/DatabaseManager")
const config = require("../../../config.json");

class LoginMessage extends PiranhaMessage {
  constructor (bytes, session) {
    super(session)
    this.id = 10101
    this.version = 0
    this.session = session
    this.stream = new ByteStream(bytes);
  }

  async decode() {
    this.stream.readInt()
    this.session.lowID = this.stream.readInt()
    this.session.token = this.stream.readString()

    this.major = this.stream.readInt()
    this.minor = this.stream.readInt()
    this.build = this.stream.readInt()
    this.fingerprint_sha = this.stream.readString() 
    this.DeviceModel = this.stream.readString()
    this.isAndroid = this.stream.readVInt()
    console.log(this.major)
    console.log(this.minor)
    console.log(this.build)
  }
      
  async process () {
    if (this.major !== config.major) {
      return await new LoginFailedMessage(this.session, `The major version does not match the server version.`, 8).send();
    }
    if (this.build !== config.build) {
      return await new LoginFailedMessage(this.session, `The minor version does not match the server version.`, 8).send();
    }

    if (!this.session.token) {
      this.session.token = crypto.randomBytes(Math.ceil(36/2)).toString('hex').slice(0, 36);
      await database.createAccount(this.session.token);
    }

    const account = await database.getAccountToken(this.session.token);
    if(account == null) return await new LoginFailedMessage(this.session, `Unknown error while loading account.`, 18).send();    
  
    this.session.lowID = account.lowID;
    this.session.Resources = account.Resources;
	
    const unlockCardsArray = Object.values(global.unlockCards);
    if (unlockCardsArray.length > account.brawlers.length) {
        unlockCardsArray.forEach((card, i) => {
            if (!account.brawlers.some(brawler => brawler.cardID === card)) {
                account.brawlers.push({
                    id: i,
                    cardID: card,
                    unlocked: i === 0,
                    level: 0,
                    points: 0,
                    trophies: 0
                });
            }
        });
        await database.replaceValue(this.session.lowID, 'brawlers', account.brawlers);
    }        
	
    await new LoginOKMessage(this.session).send();
    await new OwnHomeDataMessage(this.session, account).send(); 
  }
}

module.exports = LoginMessage