const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// Create Schema
const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  profilePic: {
    data: Buffer,
    contentType: String,
    default: []
  },
  savedRoadmap: {
    type: Object,
    default: [],
    required: true
  },
  draftRoadmap: {
    type: Object,
    default: [],
    required: true
  },
  yourRoadmap: {
    type: Object,
    default: [],
    required: true
  },
  userDescription: {
    type: String,
    default: "This author has no description yet"
  }
});
module.exports = User = mongoose.model("users", UserSchema);
