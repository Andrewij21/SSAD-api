const User = require("../models/userModel.js");
const bcrypt = require("bcrypt");
const { requestResponse } = require("../utils/requestResponse.js");
const getLogger = require("../utils/logger.js");
const createToken = require("../utils/createToken.js");
const logger = getLogger(__filename);

class AuthServices {
  async create({ username, password }) {
    const user = await User.findOne({ username });
    if (!user) return { data: requestResponse.not_found };

    const match = await bcrypt.compare(password, user.password);
    if (!match) return { data: requestResponse.unauthorized };

    // const roles = Object.values(user.roles).filter(Boolean);

    const payload = {
      username: user.username,
      roles: user.roles,
    };

    const token = await createToken(payload);
    user.refreshToken = token.refreshToken;
    await user.save();
    logger.info(`User ${user.username} is login`);
    return {
      data: {
        ...requestResponse.success,
        token: {
          refreshToken: token.refreshToken,
          accessToken: token.accessToken,
        },
        roles: user.roles,
        user: user._id,
        username: user.username,
      },
    };
  }

  async delete(refreshToken) {
    const user = await User.findOne({ refreshToken });

    if (!user) return { ...requestResponse.no_content };

    user.refreshToken = "";
    await user.save();

    return { ...requestResponse.no_content };
  }

  async forgetPassword(email) {
    const user = await User.findOne({ email });
    if (!user) throw { ...requestResponse.not_found };

    // If found send password to this email address
    return { ...requestResponse.success };
  }
}

module.exports = new AuthServices();
