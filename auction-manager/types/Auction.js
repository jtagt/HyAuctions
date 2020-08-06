const nbt = require('nbt');
const { inflate } = require('pako');
const helpers = require('../utils/helper');

class Auction {
    constructor(auction) {
        this.auction = auction;

        this.item = null;
        this.id = this.auction.uuid;
        this.itemData = null;

        this.parseItem = this.parseItem.bind(this);
        this.getItemData = this.getItemData.bind(this);
        this.getAuctionData = this.getAuctionData.bind(this);

        this.highestBidder = this.highestBidder.bind(this);

        this.indexed = this.indexed.bind(this);
        this.update = this.update.bind(this);

        this.firstIndex = false;

        this.getItemData();
    };

    update(auction) {
        this.auction = auction;
    }

    indexed() {
        this.firstIndex = true;
        this.parseItem();
    }

    getAuctionData() {
        return {
            id: this.id,
            _id: this.id,
            seller: this.auction.auctioneer,
            island: this.auction.profile_id,
            coop: this.auction.coop,
            start: this.auction.start,
            extra: this.auction.extra,
            end: this.auction.end,
            bin: this.auction.bin ? true : false,
            itemName: this.auction.item_name,
            itemLore: this.auction.item_lore,
            startingBid: this.auction.starting_bid,
            itemBytes: this.auction.item_bytes,
            highestBidAmount: this.auction.highest_bid_amount,
            itemData: this.itemData,
            bids: this.auction.bids.map(b => ({ auctionId: b.auction_id, bidder: b.bidder, profileId: b.profile_id, amount: b.amount, timestamp: b.timestamp }))
        }
    }

    getIndexData() {
        return {
            id: this.id,
            seller: this.auction.auctioneer,
            island: this.auction.profile_id,
            coop: this.auction.coop,
            start: this.auction.start,
            extra: this.auction.extra,
            end: this.auction.end,
            bin: this.auction.bin ? true : false,
            itemName: this.auction.item_name,
            itemLore: this.auction.item_lore,
            startingBid: this.auction.starting_bid,
            highestBidAmount: this.auction.highest_bid_amount,
            itemData: this.itemData,
            bids: this.auction.bids.map(b => ({ auctionId: b.auction_id, bidder: b.bidder, profileId: b.profile_id, amount: b.amount, timestamp: b.timestamp }))
        }
    }

    async getItemData() {
        const item = await this.parseItem();
        if (!item) return;

        const id = item.id.value;

        let enchantments = [];
        const isEnchants = item.tag.value.ExtraAttributes ? item.tag.value.ExtraAttributes.value.enchantments ? true : false : false;

        const isSkull = item.tag.value.SkullOwner;
        let skullId = "";

        if (isSkull) skullId = JSON.parse(helpers.atob(item.tag.value.SkullOwner.value.Properties.value.textures.value.value[0].Value.value)).textures.SKIN.url;

        let itemLore = "";
        item.tag.value.display.value.Lore.value.value.map(l => itemLore += `${l}\n`);

        const isAnvilUsed = item.tag.value.ExtraAttributes ? item.tag.value.ExtraAttributes.value.anvil_uses ? true : false : false;
        let anvilUses = 0;

        if (isAnvilUsed) {
            anvilUses = item.tag.value.ExtraAttributes.value.anvil_uses.value;
        }

        if (isEnchants) {
            const enchants = Object.entries(item.tag.value.ExtraAttributes.value.enchantments.value);
            enchants.map(e => enchantments.push({ name: e[0], value: e[1].value }));
        }

        const isHotPotatoCount = item.tag.value.ExtraAttributes ? item.tag.value.ExtraAttributes.value.hot_potato_count ? true : false : false;
        let hotPotatoCount = 0;

        if (isHotPotatoCount) hotPotatoCount = item.tag.value.ExtraAttributes.value.hot_potato_count.value;

        const isHotPotatoBonus = item.tag.value.ExtraAttributes ? item.tag.value.ExtraAttributes.value.hotPotatoBonus ? true : false : false;
        let hotPotatoBonus = "";

        if (isHotPotatoBonus) hotPotatoBonus = item.tag.value.ExtraAttributes.value.hotPotatoBonus.value;

        const isModified = item.tag.value.ExtraAttributes ? item.tag.value.ExtraAttributes.value.modifier ? true : false : false;
        let modifier = "";

        if (isModified) modifier = item.tag.value.ExtraAttributes.value.modifier.value;

        const isRunes = item.tag.value.ExtraAttributes ? item.tag.value.ExtraAttributes.value.runes ? true : false : false;
        let runes = [];

        if (isRunes) {
            const runeData = Object.entries(item.tag.value.ExtraAttributes.value.runes.value);
            runeData.map(e => runes.push({ name: e[0], value: e[1].value }));
        }

        const payload = {
            quantity: item.Count.value || 1,
            name: this.auction.item_name,
            lore: itemLore,
            enchantments,
            texture: skullId,
            tag: item.tag.value.ExtraAttributes.value.id.value,
            anvilUses,
            hotPotatoCount,
            hotPotatoBonus,
            modifier,
            runes,
            id,
            category: this.auction.category,
            tier: this.auction.tier,
            itemId: id,
            petInfo: item.tag.value.ExtraAttributes.value.id.value === "PET" ? JSON.parse(item.tag.value.ExtraAttributes.value.petInfo.value) : null
        }

        this.itemData = payload;

        return payload;
    }

    async parseItem() {
        if (this.item) return this.item;
        const inflated = inflate(helpers.atob(this.auction.item_bytes));

        const promise = new Promise((resolve, reject) => {
            nbt.parse(inflated, (e, d) => {
                this.item = d.value.i.value.value[0];
                resolve(d.value.i.value.value[0]);
            });
        });

        return promise;
    }

    get name() {
        return this.auction.item_name;
    }

    get bin() {
        return this.auction.bin ? true : false;
    }

    get bids() {
        return this.auction.bids;
    }

    get currentPrice() {
        return this.auction.highest_bid_amount > 0 ? this.auction.highest_bid_amount : this.auction.starting_bid;
    }

    highestBidder() {
        return this.auction.bids.sort((a, b) => a.amount - b.amount)[0];
    }

    get itemBytes() {
        return this.auction.item_bytes;
    }

    get start() {
        return this.auction.start;
    }

    get end() {
        return this.auction.end;
    }

    get lore() {
        return this.auction.item_lore;
    }

    get tier() {
        return this.auction.tier;
    }

    get category() {
        return this.auction.category;
    }
}

module.exports = Auction;