const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const assessmentschema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    creator: {
      type: String,
      required: true,
    },
    snippet: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    testGroup: { //{testId : 121121, groupId : 454545}
      type: Array,
      required: true
    },
    students: {
      type: Array,
      required: true
    },
    status: {
      type: Boolean //available or not
    },
    startOn: {
      type: Date
    },
    endOn: {
      type: Date
    },
    server: {
      type: String,
      default: "http://localhost:3000/assessments/"
    },
    testurl: {
      type: String
    },
    publicationID:{ 
      type: String 
    }
  },
  { timestamps: true }
);

const Assessment = mongoose.model("Assessment", assessmentschema);
module.exports = Assessment;
