const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const sanitizeFileName = (fileName) => {
  return fileName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
};

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
    creatorName: {
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
    testName: {
      type: String,
    },
    groupName: {
      type: String,
    },
    academicInstitutionName: {
      type: String,
    },
    groupSector: {
      type: String,
    },
    level: {
      type: Number,
    },
    sessionLimit: {
      type: Number,
    },
    linguistic: {
      type: Boolean,
    },
    EuropFramework: {
      type: String,
    },
    testGroup: {
      // {testId : 121121, groupId : 454545}
      type: Array,
      required: true,
    },
    subject: {
      type: String,
    },
    duration: {
      type: String,
    },
    students: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student', // Assurez-vous de référencer le bon modèle
      required: true,
    }],
    status: {
      type: Boolean, // available or not
    },
    startOn: {
      type: Date,
    },
    endOn: {
      type: Date,
    },
    server: {
      type: String,
      default: "http://localhost:3000/publications/",
    },
    testurl: {
      type: String,
    },
    csvName: {
      type: String,
    },
  },
  { timestamps: true }
);

publicationschema.pre('save', function(next) {
  if (this.isNew || this.isModified('title')) {
    this.csvName = sanitizeFileName(this.title) + '_' + this._id;
  }
  next();
});

const Publication = mongoose.model("Publication", publicationschema);
module.exports = Publication;
