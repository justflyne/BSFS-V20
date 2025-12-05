const fs = require('fs');
const PiranhaMessage = require('../../PiranhaMessage')
const ByteStream = require("../../../ByteStream")
const database = require("../../../Database/DatabaseManager")


class AnalyticEventMessage extends PiranhaMessage {
  constructor (bytes, session, account) {
    super(session)
    this.session = session
    this.id = 10110
    this.version = 0
    this.stream = new ByteStream(bytes)
  }

  async decode () {
      this.type = this.stream.readString()
      this.event = this.stream.readString()
  }

  async process () {
    const account = await database.getAccount(this.session.lowID)
    if (this.type === "tutorial_step" && this.event.step == "click_to_end" && this.event.step_id == "18"){
        this.account.tutorialState = 1
    }
  console.log(`[INFO] NEW EVENT Type: ${this.type}\nEvent: ${this.event}.`)
  }
}

module.exports = AnalyticEventMessage