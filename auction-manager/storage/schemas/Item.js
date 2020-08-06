const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ItemSchema = new Schema({
    name: String,
    category: String,
    tier: String,
    texture: String,
    tag: String,
    itemId: String,
    createdAt: Number
});

module.exports = mongoose.model('items', ItemSchema);