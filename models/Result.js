const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    timeStamp: { type: Date, default: Date.now },
    userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    publicationID: { type: mongoose.Schema.Types.ObjectId, ref: 'Publication', required: true },
    identifier: { type: String, required: true },
    value: { type: String, required: true },
    outcome: { type: String, default: '0' }
});

const Result = mongoose.model('Result', resultSchema);

module.exports = Result;
