const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const testSchema = new Schema(
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
    subject:{
      type:String,
      required : true
    },
    testpath : {
      type:String
    }, 
    uniCode : {
      type:String
    }, 
    comment:{
      type: String,
    },
    itemNB:{
      type: String,
    },
    answerNB:{
      type: String,
    },
    add_data:{
      type: Object,
    },
    flow:{
      type: String,
    },
    duration:{
      type: String,
    },
    session:{
      type : String,
    },
    grade:{
      type : String,
    },
    type:{
      type : String,
    },
    correction:{
      type: Object,
    }

  },
  { timestamps: true }
);

const test = mongoose.model("test", testSchema);
module.exports = test;
