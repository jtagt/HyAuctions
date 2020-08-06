const mongoose = require('mongoose');
const config = require('../config');

class Database {
    constructor() {
        this.auction = require('./schemas/Auction');
        this.item = require('./schemas/Item');
        this.user = require('./schemas/HypixelUser');
        this.island = require('./schemas/Island');
        this.member = require('./schemas/Member');

        this.connect();
    }

    connect() {
        this.db = mongoose.connect(config.mongodb, { useNewUrlParser: true, useUnifiedTopology: true, keepAlive: true }).catch(() => setTimeout(() => this.connect(), 5000));
        mongoose.set('useCreateIndex', true);
        mongoose.set('autoIndex', true);
    }
}

module.exports = Database;