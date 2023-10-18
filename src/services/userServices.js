const User = require("../models/userModel.js");
const isValidId = require("../utils/isValidId.js");
const bcrypt = require("bcrypt");
const { requestResponse } = require("../utils/requestResponse.js");
const getLogger = require("../utils/logger.js");
const logger = getLogger(__filename);

class UserServices {
  async get() {
    const users = await User.find({});
    logger.info(`Get ${users.length} users `);
    return { ...requestResponse.success, data: users };
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
  async update(body, _id) {
    if (!isValidId(_id))
      throw { ...requestResponse.bad_request, message: "Invalid ID" };
    const user = await User.findOneAndUpdate(
      { _id },
      { ...body },
      { new: true }
    );

    if (!user) throw { ...requestResponse.not_found };

    logger.info(`Update users with ID ${user._id} `);
    return { ...requestResponse.success, data: user };
  }
  async delete(_id) {
    if (!isValidId(_id))
      throw { ...requestResponse.bad_request, message: "Invalid ID" };
    const user = await User.findOneAndDelete({ _id });

    if (!user) throw { ...requestResponse.not_found };

    logger.info(`Delete with ID ${user._id} `);
    return { ...requestResponse.success, data: user };
  }
}

module.exports = new UserServices();
