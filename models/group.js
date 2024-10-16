
const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const groupSchema = new Schema(
  {
    
    groupName: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    students: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    body: {
      type: String,
      required: false,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }, 
    institution: {
      type: String,
      required: false,
    }, 
    level: {
      type: String,
      required: false,
    }, 
    sector: {
      type: String,
      required: false,
    }
  },
  { timestamps: true }
);

const Group = mongoose.model("Group", groupSchema);
module.exports = Group;

