const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AuctionSchema = new Schema({
    _id: String,
    seller: String,
    coop: [String],
    island: String,
    start: Number,
    end: Number,
    itemName: String,
    itemLore: String,
    itemData: {
        quantity: Number,
        name: String,
        lore: String,
        enchantments: [{ name: String, value: String }],
        texture: String,
        tag: String,
        anvilUses: Number,
        hotPotatoCount: Number,
        hotPotatoBonus: String,
        modifier: String,
        runes: [{ name: String, value: String }],
        id: String,
        petInfo: Object
    },
    extra: String,
    category: String,
    tier: String,
    startingBid: Number,
    itemBytes: String,
    highestBidAmount: Number,
    bids: [{ auctionId: String, bidder: String, profileId: String, amount: Number, timestamp: Number }],
    topBidder: String,
    bin: Boolean
});

module.exports = mongoose.model('auctions', AuctionSchema);