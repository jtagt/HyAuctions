const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const IslandSchema = new Schema({
    _id: String,
    cuteName: String,
    banking: {
        balance: Number,
        transactions: [
            {
                amount: Number,
                timestamp: Number,
                action: String,
                initiatorName: String
            }
        ]
    },
    lastUpdated: Number
});

module.exports = mongoose.model('islands', IslandSchema);