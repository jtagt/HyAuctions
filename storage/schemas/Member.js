const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MemberSchema = new Schema({
    _id: String,
    username: String,
    tag: String,
    inServer: Boolean,
    lastUpdated: Number
});

module.exports = mongoose.model('members', MemberSchema);