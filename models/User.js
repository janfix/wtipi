const mongoose = require("mongoose");
const { isEmail } = require("validator");
const bcrypt = require("bcrypt");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  firstname : {
    type: String,
  },
  lastname : {
    type: String,
  },
  role:{
    type: String
  },
  group : {
    type : Array
  },
  SID : {
    type : String
  },
  email: {
    type: String,
    required: [true, "Please enter an E-mail."],
    unique: true,
    lowercase: true,
    validate: [isEmail, "Please enter a valid E-mail."],
  },
  password: {
    type: String,
    required: [true, "Please enter a password."],
    minlength: [6, "Minimun password length is 6 characters."],
  },
  tests:{
    type : Array
  },
  publication:{
    type : Array
  }
});

// Middleware pour hasher le mot de passe uniquement s'il est modifié
userSchema.pre("save", async function (next) {
  // Vérifiez si le mot de passe a été modifié
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// static method to login user
userSchema.statics.login = async function (email, password) {
  const user = await this.findOne({ email });
  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      return user;
    }
    throw Error("Incorrect password");
  }
  throw Error("Incorrect Email");
};



const User = mongoose.model("user", userSchema);
module.exports = User;
