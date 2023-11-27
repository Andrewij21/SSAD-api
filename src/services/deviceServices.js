const Device = require("../models/deviceModel.js");
const User = require("../models/userModel.js");
const isValidId = require("../utils/isValidId.js");
const locationService = require("./locationServices.js");
const bcrypt = require("bcrypt");
const { requestResponse } = require("../utils/requestResponse.js");
const getLogger = require("../utils/logger.js");
const logger = getLogger(__filename);

class DeviceServices {
  async get(payload) {
    const query = payload
      ? {
          $or: [{ "area.location": { $regex: payload, $options: "i" } }], //SEARCH BASED ON AREA AND CASE INSENSITIVE
        }
      : {};
    const devices = await Device.find(query).populate({
      path: "user",
      select: "-password -__v -area",
    });
    logger.info(`Get ${devices.length} device `);
    return { ...requestResponse.success, data: devices };
  }
  async getCount() {
    const devices = await Device.find({}).count();
    logger.info(`Get ${devices} device `);
    return { ...requestResponse.success, data: { length: devices } };
  }
  async create(body) {
    const userId = body.user;
    let area = {};
    if (userId && !isValidId(userId))
      throw { ...requestResponse.bad_request, message: "Invalid user ID" };
    const exist = await Device.findOne({ name: body.name });
    if (exist)
      return { ...requestResponse.conflict, message: "device already exist" };

    if (body.location) {
      area = {
        location: body.location,
      };

      if (body.latLng) {
        const getLocation = await locationService.get(body.latLng);
        if (getLocation.code !== 200) throw getLocation;

        const {
          area: { city, region, road, state, village },
          formatedLoc,
        } = getLocation;

        area = {
          pulau: region,
          kota: city,
          jalan: road,
          prov: state,
          desa: village,
          latLong: [body.latLng.lat, body.latLng.lng],
          location: formatedLoc,
        };
      }
    }
    // console.log({ body });
    const device = await Device.create({ ...body, area, user: userId || null });
    if (userId) {
      // const updateUser = await userService.addDevices({
      //   device: device._id,
      //   id: user,
      // });
      const user = await User.findById(userId);
      if (!user) throw { ...requestResponse.not_found };
      user.devices.push(device);
      await user.save();
    }

    logger.info(`Create Device with ID ${device._id}  `);
    return {
      ...requestResponse.created,
      data: {
        _id: device._id,
        name: device.name,
        user: device.user,
        macaddress: device.macaddress,
        location: device.area.location,
      },
    };
  }
  async addUser({ id, user }) {
    if (!isValidId(id))
      throw { ...requestResponse.bad_request, message: "Invalid ID" };
    if (!isValidId(user))
      throw { ...requestResponse.bad_request, message: "Invalid ID" };
    // NEXT USER TIDAK BISA DITAMBAHKAN JIKA SUDAH ADA USER DI DALAM DATA DEVICE
    const device = await Device.findOneAndUpdate(
      { _id: id },
      { user },
      { new: true }
    );

    if (!device) throw { ...requestResponse.not_found };

    logger.info(`Update users with ID ${device._id} `);
    return { ...requestResponse.success, data: device };
  }
  async update(body, _id) {
    console.log({ body, _id });
    if (!isValidId(_id))
      throw { ...requestResponse.bad_request, message: "Invalid ID" };
    const device = await Device.findOneAndUpdate(
      { _id },
      { ...body },
      { new: true }
    );

    if (!device) throw { ...requestResponse.not_found };

    logger.info(`Update users with ID ${device._id} `);
    return { ...requestResponse.success, data: device };
  }
  async delete(_id) {
    if (!isValidId(_id))
      throw { ...requestResponse.bad_request, message: "Invalid ID" };

    const device = await Device.findOneAndDelete({ _id });
    if (!device)
      throw { ...requestResponse.not_found, message: "device not found" };

    // console.log({ device });
    const user = await User.findById(device.user);
    // console.log({ user });
    // throw { ...requestResponse.not_found, message: "user not found" };
    if (user) {
      const filteredDevice = user.devices.filter(
        (deviceId) => device._id.toString() != deviceId.toString()
      );
      // console.log({ filteredDevice });
      user.devices = filteredDevice;
      await user.save();
      // console.log({ val });
    }

    logger.info(`Delete   with ID ${device._id} `);
    return { ...requestResponse.success, data: device };
  }
}

module.exports = new DeviceServices();
