const ByteStream = require("../ByteStream")

class GatchaDrop extends PiranhaMessage {
  constructor(session, box, item=0, amount=0, id = -1, trophyRoadProgress) {
  super(session);
      this.id = 24111;
      this.session = session;
      this.version = 1;
      this.stream = new ByteStream();
      this.box = box
      this.item = item
      this.amount = amount
      this.id = id
      this.trophyRoadProgress = trophyRoadProgress
      this.items = []
  }
async encode() {
  this.stream.writeVInt(203);
  this.stream.writeVInt(0);

  this.stream.writeVInt(1)
  this.stream.writeVInt(100)
  this.stream.writeVInt(1)
  this.stream.writeVInt(this.amount)
  if (this.id == -1){
      this.stream.writeVInt(0)
  }
  else{
      this.stream.writeVInt(16)
      this.stream.writeVInt(this.id)
  }
  this.stream.writeVInt(this.item)
  this.stream.writeVInt(0)
  this.stream.writeVInt(0)
  this.stream.writeVInt(0)

  this.stream.writeVInt(this.trophyRoadProgress + 1)
}
}

module.exports = GatchaDrop;