const { model, Schema } = require("mongoose");

const schema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  devices: [String],
  area: String,
  roles: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
});

module.exports = model("user", schema);
