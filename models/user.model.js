const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  fullname: {
    type: String,
    require: true,
  },
  username: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
  },
  password: {
    type: String,
    require: true,
  },
  post:[
    {
      type:mongoose.Schema.Types.ObjectId,
      ref: "TravelStory"
    }
  ],
  createdOn: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);
