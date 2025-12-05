class PlayerDisplayData {
    PlayerDisplayData(stream, name, playerThumbnail, nameColor) {
        this.name = name;
        this.playerThumbnail = playerThumbnail
        this.nameColor = nameColor
        stream.writeString(this.name);
        stream.writeVInt(100);
        stream.writeVInt(28000000 + this.playerThumbnail);
        stream.writeVInt(43000000 + this.nameColor);
    }            
}

module.exports = PlayerDisplayData;