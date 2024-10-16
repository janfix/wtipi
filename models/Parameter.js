const mongoose = require('mongoose');

const parameterSchema = new mongoose.Schema({
    DisplayMode: { 
        type: String, 
        default: "clear" 
    }
});

const Parameter = mongoose.model('Parameter', parameterSchema);

module.exports = Parameter;