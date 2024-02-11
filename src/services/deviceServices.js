const Device = require("../models/deviceModel.js");
const User = require("../models/userModel.js");
const isValidId = require("../utils/isValidId.js");
const locationService = require("./locationServices.js");
const bcrypt = require("bcrypt");
const { requestResponse } = require("../utils/requestResponse.js");
const getLogger = require("../utils/logger.js");
const logger = getLogger(__filename);

const STATUS = ["online", "offline"];

class DeviceServices {
  async get({ q, page = 1, perpage = 5 }) {
    const query = q
      ? {
          $or: [{ "area.location": { $regex: q, $options: "i" } }], //SEARCH BASED ON AREA AND CASE INSENSITIVE
        }
      : {};
    const devices = await Device.find(query)
      .populate({
        path: "user",
        select: "-password -__v -area -refreshToken -devices",
      })
      .select("-__v")
      .limit(perpage)
      .skip((page - 1) * perpage);

    const totalDevices = await Device.count();
    const totalPages = Math.ceil(totalDevices / perpage);

    logger.info(`Get ${devices.length} device `);
    return {
      ...requestResponse.success,
      page,
      perpage,
      totalPages,
      data: devices,
    };
  }
  async getCount() {
    const devices = await Device.count();

    logger.info(`Get ${devices} device `);
    return { ...requestResponse.success, data: { length: devices } };
  }
  async create(body) {
    // const userId = body.user;
    let area = {};
    // if (userId && !isValidId(userId))
    //   throw { ...requestResponse.bad_request, message: "Invalid user ID" };
    const exist = await Device.findOne({ macaddress: body.macaddress });
    if (exist)
      return { ...requestResponse.conflict, message: "device already exist" };

    if (body.location) {
      area = {
        location: body.location,
      };

      if (body.location.latLng) {
        const getLocation = await locationService.get(body.location.latLng);
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
          latLong: [body.location.latLng.lat, body.location.latLng.lng],
          location: formatedLoc,
        };
      }
    }
    const device = await Device.create({ ...body, area });
    // if (userId) {
    // const user = await User.findById(userId);
    // if (!user) throw { ...requestResponse.not_found };
    // user.devices.push(device);
    // await user.save();
    // }

    logger.info(`Create Device with ID ${device._id}  `);
    return {
      ...requestResponse.created,
      data: {
        _id: device._id,
        name: device.name,
        // user: device.user,
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
    let query = {};
    if (_id && !isValidId(_id)) {
      query = { macaddress: _id };
    } else {
      query = { _id };
    }
    if (
      body?.status?.hasOwnProperty("message") &&
      !STATUS.includes(body.status.message)
    )
      throw {
        ...requestResponse.bad_request,
        message: "status message invalid please input(online or offline) ",
      };

    if (
      body?.status?.hasOwnProperty("value") &&
      typeof body.status.value !== "boolean"
    )
      throw {
        ...requestResponse.bad_request,
        message: "status value is need to be boolean",
      };

    const device = await Device.findOneAndUpdate(
      query,
      { ...body, user: body.user || null },
      { new: true, runValidators: true }
    ).populate({
      path: "user",
      select: "-password -__v -area -refreshToken -devices",
    });

    if (!device) throw { ...requestResponse.not_found };

    logger.info(`Update users with ID ${device._id} `);
    return { ...requestResponse.success, data: device };
  }
  async updateRPM(body, id) {
    let query = {};
    if (id && !isValidId(id)) {
      query = { macaddress: id };
    } else {
      query = { id };
    }

    const device = await Device.findOneAndUpdate(
      query,
      { RPM: body.RPM },
      { new: true, runValidators: true }
    );

    if (!device) throw { ...requestResponse.not_found };

    logger.info(`Update Device RPM with ID ${device.id}`);
    return { ...requestResponse.success, data: device };
  }
  async delete(_id) {
    if (!isValidId(_id))
      throw { ...requestResponse.bad_request, message: "Invalid ID" };

    const device = await Device.findOneAndDelete({ _id });
    if (!device)
      throw { ...requestResponse.not_found, message: "device not found" };

    const user = await User.findById(device.user);

    if (user) {
      //REMOVE DEVICE FROM USER THAT HAVE THIS DEVICE
      const filteredDevice = user.devices.filter(
        (deviceId) => device._id.toString() != deviceId.toString()
      );
      user.devices = filteredDevice;
      await user.save();
    }

    logger.info(`Delete   with ID ${device._id} `);
    return { ...requestResponse.success, data: device };
  }
  async find(id) {
    // console.log({ id });
    let query = {};
    if (id && !isValidId(id)) {
      query = { macaddress: id };
    } else {
      query = { _id: id };
    }
    const exist = await Device.findOne(query).populate({
      path: "user",
      select: "-password -__v -area -refreshToken -devices",
    });
    if (!exist)
      return { ...requestResponse.not_found, message: "device not found" };

    logger.info(`Get ${id} device `);
    return { ...requestResponse.success, data: exist };
  }
}

module.exports = new DeviceServices();
