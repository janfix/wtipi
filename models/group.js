
const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const groupSchema = new Schema(
  {
    groupID: {
      type: String,
      required: false,
    },
    groupName: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    students : {
      type: Array,
      required : true
    },
    body: {
      type: String,
      required: false,
    },
    creator: {
      type:String
    }
  },
  { timestamps: true }
);

const Group = mongoose.model("Group", groupSchema);
module.exports = Group;

