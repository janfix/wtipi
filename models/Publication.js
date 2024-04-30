const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const publicationschema = new Schema(
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
    testName : {
       type: String,
    },
    groupName:{
      type: String,
    },
    academicInstitutionName:{
       type: String,
    },
    groupSector:{
      type : String,
    },
    level:{
      type : Number,
    },
    sessionLimit:{
      type : Number
    },
    linguistic : {
      type: Boolean,
    },
    EuropFramework : {
      type : String,
    },
    testGroup: { //{testId : 121121, groupId : 454545}
      type: Array,
      required: true
    },
    subject:{
       type : String,
    },
    duration:{
        type : String,
    },
    students : {
      type: Array,
      required : true
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
      default: "http://localhost:3000/publications/"
    },
    testurl: {
      type: String
    }
  },
  { timestamps: true }
);

const Publication = mongoose.model("Publication", publicationschema);
module.exports = Publication;
