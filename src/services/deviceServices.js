const Device = require("../models/deviceModel.js");
const isValidId = require("../utils/isValidId.js");
const bcrypt = require("bcrypt");
const { requestResponse } = require("../utils/requestResponse.js");
const getLogger = require("../utils/logger.js");
const logger = getLogger(__filename);

class DeviceServices {
  async get() {
    const devices = await Device.find({});
    logger.info(`Get ${devices.length} device `);
    return { ...requestResponse.success, data: devices };
  }
  async create(body) {
    const exist = await Device.findOne({ name: body.name });
    if (exist) return { ...requestResponse.conflict };

    // console.log({ body });
    const result = await Device.create(body);

    // const newDevice = new Device(body);

    // Push the new user to the "users" array
    // newDevice.users.push(body.users);

    // Save the updated device
    // const result = await newDevice.save();

    logger.info(`Create user with ID ${result._id}  `);
    return {
      ...requestResponse.created,
      data: { _id: result._id, name: result.name, user: result.user },
    };
  }
  async addUser({ id, user }) {
    if (!isValidId(id))
      throw { ...requestResponse.bad_request, message: "Invalid ID" };
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

    if (!device) throw { ...requestResponse.not_found };

    logger.info(`Delete   with ID ${device._id} `);
    return { ...requestResponse.success, data: device };
  }
}

module.exports = new DeviceServices();
