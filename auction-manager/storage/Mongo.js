const mongoose = require('mongoose');
const config = require('../config');

class Database {
    constructor() {
        this.item = require('./schemas/Item');
        this.auction = require('./schemas/Auction');
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