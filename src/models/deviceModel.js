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
  area: {
    kec: Object,
    prov: Object,
    kab: Object,
    desa: Object,
    pulau: Object,
    kota: Object,
    jalan: Object,
    latLong: [],
    location: Object,
  },
  verified: {
    type: Boolean,
    default: false,
  },
});

module.exports = model("device", schema);
