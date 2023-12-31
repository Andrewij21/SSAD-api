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
  macaddress: String,
  devices: [
    {
      type: Schema.Types.ObjectId,
      ref: "device",
    },
  ],
  roles: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  refreshToken: String,
});

module.exports = model("user", schema);
