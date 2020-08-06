const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.ObjectId;

const HypixelUserSchema = new Schema({
    _id: String,
    lastLogin: Number,
    username: String,
    profiles: [
        {
            _id: String,
            cuteName: String
        }
    ],
    lastUpdated: Number,
    views: Number
});

module.exports = mongoose.model('users', HypixelUserSchema);