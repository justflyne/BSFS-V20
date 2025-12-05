const fs = require('fs');
const PiranhaMessage = require('../../PiranhaMessage')
const ByteStream = require("../../../ByteStream")

class LoginFailedMessage extends PiranhaMessage {
  constructor (session, message, errorCode) {
    super(session)
    this.id = 20103
    this.session = session
    this.message = message
    this.errorCode = errorCode
    this.version = 0
    this.stream = new ByteStream()
    //this.maintenanceTimer = maintenanceTimer
  }
  // << Error Code List >>
  // # 1  = Custom Message
  // # 7  = Patch
  // # 8  = Update Available
  // # 9  = Redirect
  // # 10 = Maintenance
  // # 11 = Banned
  // # 13 = Acc Locked PopUp
  // # 16 = Updating Cr/Maintenance/Too high version
  // # 18 = Chinese Text?
  async encode () {
    this.stream.writeInt(this.errorCode)

    this.stream.writeString() // your finger
    this.stream.writeString() // serverHost

    this.stream.writeString() // patchurl
    this.stream.writeString("t.me/projectbsfs") // updateurl
    this.stream.writeString(this.message)

    this.stream.writeInt(3600)
    this.stream.writeBoolean(true)

    this.stream.writeString()
    this.stream.writeString()

    this.stream.writeInt(0)
    this.stream.writeInt(3)

    this.stream.writeString()
    this.stream.writeString()

    this.stream.writeInt(0)
    this.stream.writeInt(0)

    this.stream.writeBoolean(false)
    this.stream.writeBoolean(false)
  }
}

module.exports = LoginFailedMessage