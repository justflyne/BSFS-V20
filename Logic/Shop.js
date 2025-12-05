const fs = require('fs');
const path = require('path');
const Character = require("../Assets/Characters");

class Shop {
    constructor() {
        this.shopArray = this.loadShopArray();
    }
    
    encode(stream, account) {

        function adjustTimeToNextDay(initialTime) {
            const currentTime = new Date();
            const targetTime = new Date(initialTime);

            if (currentTime >= targetTime) {
                targetTime.setDate(targetTime.getDate() + 1);
            }

            const differenceInSeconds = Math.floor((targetTime - currentTime) / 1000);

            return differenceInSeconds;
        }        

        this.stream = stream
        this.offers = account.shop
        this.stream.writeVInt(this.offers.length)

        for (let offer of this.offers) {
            this.stream.writeVInt(offer.includes.length)
            for (let item of offer.includes) {
                this.stream.writeVInt(item.id)
                this.stream.writeVInt(item.multiplier)
                this.stream.writeDataReference(item.dataRef[0], item.dataRef[1])
                this.stream.writeVInt(item.skinId)
            }
            this.stream.writeVInt(offer.shopType)

            this.stream.writeVInt(offer.cost)
            this.stream.writeVInt(offer.endTime)
            this.stream.writeVInt(offer.isViewed)//Offer View | 0 = Absolutely "NEW", 1 = "NEW", 2 = Viewed
            this.stream.writeVInt(100)
            this.stream.writeBoolean(offer.isPurchased)// purchased

            this.stream.writeVInt(0)
            this.stream.writeVInt(offer.isDailyDeals)// [0 = Normal, 1 = Daily Deals]
            this.stream.writeVInt(offer.oldCost)
            this.stream.writeString(offer.name)

            this.stream.writeBoolean(false)
        }
    }
}

module.exports = Shop;