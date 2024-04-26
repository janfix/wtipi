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
    }
  },
  { timestamps: true }
);

const test = mongoose.model("test", testSchema);
module.exports = test;
