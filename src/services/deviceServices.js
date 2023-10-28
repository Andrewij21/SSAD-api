const Device = require("../models/deviceModel.js");
const userService = require("./userServices.js");
const isValidId = require("../utils/isValidId.js");
const bcrypt = require("bcrypt");
const { requestResponse } = require("../utils/requestResponse.js");
const getLogger = require("../utils/logger.js");
const logger = getLogger(__filename);

class DeviceServices {
  async get() {
    const devices = await Device.find({}).populate({
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
    const user = body.user;
    if (user && !isValidId(user))
      throw { ...requestResponse.bad_request, message: "Invalid ID" };
    const exist = await Device.findOne({ name: body.name });
    if (exist) return { ...requestResponse.conflict };

    // console.log({ body });
    const device = await Device.create(body);
    if (user) {
      const updateUser = await userService.addDevices({
        device: device._id,
        id: user,
      });
      if (!updateUser)
        return {
          ...requestResponse.server_error,
          message: "failed to add device to user",
        };
    }
    // const newDevice = new Device(body);

    // Push the new user to the "users" array
    // newDevice.users.push(body.users);

    // Save the updated device
    // const result = await newDevice.save();

    logger.info(`Create Device with ID ${device._id}  `);
    return {
      ...requestResponse.created,
      data: { _id: device._id, name: device.name, user: device.user },
    };
  }
  async addUser({ id, user }) {
    if (!isValidId(id))
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
    if (!isValidId(body.user))
      throw {
        ...requestResponse.bad_request,
        message: "Invalid ID " + body.user,
      };
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

    if (!device) throw { ...requestResponse.not_found };

    logger.info(`Delete   with ID ${device._id} `);
    return { ...requestResponse.success, data: device };
  }
}

module.exports = new DeviceServices();
