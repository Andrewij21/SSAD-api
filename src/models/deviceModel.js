const { model, Schema } = require("mongoose");

const schema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  user: {
    type: String,
  },
  verified: {
    type: Boolean,
    default: false,
  },
});

module.exports = model("device", schema);
