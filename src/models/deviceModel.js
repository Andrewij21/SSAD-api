const { model, Schema } = require("mongoose");

const schema = new Schema({
  macaddress: String,
  name: {
    type: String,
    required: true,
    unique: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  status: {
    value: {
      type: Boolean,
      default: false,
    },
    message: {
      type: String,
      default: "offline",
      enum: ["offline", "online"],
    },
  },
  verified: {
    type: Boolean,
    default: false,
  },
});

module.exports = model("device", schema);
