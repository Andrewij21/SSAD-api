const User = require("../models/userModel.js");
const bcrypt = require("bcrypt");
const { requestResponse } = require("../utils/requestResponse.js");
const getLogger = require("../utils/logger.js");
const createToken = require("../utils/createToken.js");
const jwt = require("jsonwebtoken");
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
      user: user._id,
    };

    const token = await createToken(payload);
    user.refreshToken = token.refreshToken;
    await user.save();
    logger.info(`User ${user.username} is login`);
    return {
      refreshToken: token.refreshToken,
      data: {
        ...requestResponse.success,
        data: {
          accessToken: token.accessToken,
          roles: user.roles,
          user: user._id,
          username: user.username,
        },
      },
    };
  }
  async refreshToken(refreshToken) {
    const user = await User.findOne({ refreshToken }).select("-password -__v");
    if (!user) return { ...requestResponse.forbidden };
    const token = await jwt.verify(
      refreshToken,
      process.env.SECRET_REFRESH_TOKEN
    );
    if (!token || token.username !== user.username)
      return { ...requestResponse.forbidden };

    // const roles = Object.values(user.roles).filter(Boolean);
    const accessToken = jwt.sign(
      { username: token.username, roles: user.roles, user: user._id },
      process.env.SECRET_ACCESS_TOKEN,
      { expiresIn: "10s" }
    );

    logger.info(`refresh token user ${token.username}`);
    return {
      ...requestResponse.success,
      data: {
        accessToken,
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
