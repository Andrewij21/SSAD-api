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
  roles: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  refreshToken: String,
});

module.exports = model("user", schema);
