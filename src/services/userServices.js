const User = require("../models/userModel.js");
const Device = require("../models/deviceModel.js");
const isValidId = require("../utils/isValidId.js");
// const locationService = require("./locationServices.js");
const bcrypt = require("bcrypt");
const { requestResponse } = require("../utils/requestResponse.js");
const getLogger = require("../utils/logger.js");
const logger = getLogger(__filename);

class UserServices {
  async get() {
    const users = await User.find()
      .populate({
        path: "devices",
        select: "-__v",
      })
      .select("-__v -password");
    // console.log(users[1]["devices"]);
    logger.info(`Get ${users.length} users `);
    return { ...requestResponse.success, data: users };
  }
  async getCount() {
    const users = await User.find({}).count();
    logger.info(`Get ${users} user `);
    return { ...requestResponse.success, data: { length: users } };
  }
  async create(body) {
    const exist = await User.findOne({ username: body.username });
    if (exist) return { ...requestResponse.conflict };

    const hashPassword = await bcrypt.hash(body.password, 10);
    const result = await User.create({ ...body, password: hashPassword });

    logger.info(`Create user with ID ${result._id}  `);
    return {
      ...requestResponse.created,
      data: { id: result._id, username: result.username },
    };
  }
  async removeDevices({ id, device }) {
    // console.log({ id, device });
    if (!isValidId(id))
      throw { ...requestResponse.bad_request, message: "Invalid ID" };
    const user = await User.findById(id);
    if (!user) throw { ...requestResponse.not_found };

    const registedDevice = await Device.findOne({ macaddress: device });
    if (!registedDevice)
      throw {
        ...requestResponse.not_found,
        message: `Device ${device} not found`,
      };

    const filteredDevice = user.devices.filter(
      (deviceId) => registedDevice._id + "" != deviceId
    );
    // console.log({ filteredDevice });
    // const addUserTodevice = await Device.findOneAndUpdate(
    //   { _id: registedDevice._id },
    //   { user: id },
    //   { new: true }
    // );

    // if (!addUserTodevice)
    //   throw {
    //     ...requestResponse.not_found,
    //     message: `Device ${device} not found`,
    //   };
    registedDevice.user = null;
    user.devices = filteredDevice;
    // user.area = {}; // empty area

    await user.save();
    await registedDevice.save();

    logger.info(`Update users with ID ${user._id} `);
    return { ...requestResponse.success, data: user };
  }
  async addDevices({ id, device, latLng }) {
    // console.log({ id, device });
    if (!isValidId(id))
      throw { ...requestResponse.bad_request, message: "Invalid ID" };
    const user = await User.findById(id).select("-password -__v -refreshToken");
    if (!user) throw { ...requestResponse.not_found };

    const registedDevice = await Device.findOne({ macaddress: device });
    if (!registedDevice)
      throw {
        ...requestResponse.not_found,
        message: `Device ${device} not found`,
      };

    const deviceExist = user.devices.filter(
      (deviceId) => registedDevice._id + "" == deviceId
    );
    // console.log({ deviceExist });
    if (deviceExist.length != 0)
      throw { ...requestResponse.conflict, message: "Device already register" };

    // const getLocation = await locationService.get(latLng);
    // if (getLocation.code !== 200) throw getLocation;

    // const {
    //   area: { city, region, road, state, village },
    //   formatedLoc,
    // } = getLocation;

    registedDevice.user = id;
    user.devices.push(registedDevice._id);
    // user.area.pulau = region;
    // user.area.kota = city;
    // user.area.jalan = road;
    // user.area.prov = state;
    // user.area.desa = village;
    // user.area.latLong = [latLng.lat, latLng.lng];
    // user.area.location = formatedLoc;

    await user.save();
    await registedDevice.save();

    logger.info(`Update users with ID ${user._id} `);
    return { ...requestResponse.success, data: user };
  }
  async updatePassword(password, _id) {
    if (!isValidId(_id))
      throw { ...requestResponse.bad_request, message: "Invalid ID" };
    const hashPassword = await bcrypt.hash(password, 10);
    const user = await User.findOneAndUpdate(
      { _id },
      { password: hashPassword },
      { new: true }
    );

    if (!user) throw { ...requestResponse.not_found };
    console.log({ password, _id });
    logger.info(`Update users with ID ${user._id} `);
    return { ...requestResponse.success, data: user };
    // return { ...requestResponse.success };
  }
  async update(body, _id) {
    if (!isValidId(_id))
      throw { ...requestResponse.bad_request, message: "Invalid ID" };

    let data = { ...body };
    if (body.password) {
      const hashPassword = await bcrypt.hash(body.password, 10);
      data = { ...body, password: hashPassword };
    }
    const user = await User.findOneAndUpdate({ _id }, data, { new: true });

    if (!user) throw { ...requestResponse.not_found };

    logger.info(`Update users with ID ${user._id} `);
    return { ...requestResponse.success, data: user };
  }
  async delete(_id) {
    if (!isValidId(_id))
      throw { ...requestResponse.bad_request, message: "Invalid ID" };
    const user = await User.findOneAndDelete({ _id });

    if (!user) throw { ...requestResponse.not_found };

    if (user.devices && user.devices.length > 0) {
      const deviceIds = user.devices;
      await Device.updateMany(
        { _id: { $in: deviceIds } },
        { $set: { user: null } }
      );
    }

    logger.info(`Delete with ID ${user._id} `);
    return { ...requestResponse.success, data: user };
  }
}

module.exports = new UserServices();
