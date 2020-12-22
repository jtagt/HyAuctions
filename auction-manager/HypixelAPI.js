const axios = require('axios');
const config = require('./config');
const URL = require('url').URL;

const HYPIXEL_API = "https://api.hypixel.net";
const AUCTIONS_ROUTE = HYPIXEL_API + "/skyblock/auctions";
const PLAYER_ROUTE = HYPIXEL_API + "/player";
const PROFILES_ROUTE = HYPIXEL_API + "/skyblock/profiles";

const MC_HEADS = "https://mc-heads.net";
const MC_HEADS_PLAYER_ROUTE = MC_HEADS + "/minecraft/profile";

class Hypixel {
    constructor() {
        this.tokens = config.hypixelTokens;

        this.currentIndex = 0;
    }

    rotateToken() {
        if (this.currentIndex + 1 === this.tokens.length) this.currentIndex = -1;
        this.currentIndex = this.currentIndex + 1;

        return this.tokens[this.currentIndex];
    }

    /**
     * Fetches a auction page based on number.
     * @param {Number} page
     * @returns {Object} The auctions data.
     */
    async getAuctionPage(page = 0) {
        const url = new URL(AUCTIONS_ROUTE);
        url.searchParams.append('page', page);

        const response = await axios(url.toString());

        return response.data;
    }

    /**
     * Fetches island data based off the id provided.
     * @param {String} id
     * @returns {Array} The islands data.
     */
    async getPlayerIslands(id) {
        const url = new URL(PROFILES_ROUTE);
        url.searchParams.append('uuid', id);
        url.searchParams.append('key', this.rotateToken());

        const response = await axios(url.toString());

        return response.data;
    }

    async getPlayer(id) {
        const url = new URL(PLAYER_ROUTE);
        url.searchParams.append('uuid', id);
        url.searchParams.append('key', this.rotateToken());

        const response = await axios(url.toString());

        return response.data;
    }

    async getMinecraftPlayer(id) {
        const response = await axios(`${MC_HEADS_PLAYER_ROUTE}/${id}`);

        if (response.status === 204) return null;

        return response.data;
    }
}

module.exports = Hypixel;
