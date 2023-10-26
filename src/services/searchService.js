const User = require("../models/userModel");
const { requestResponse } = require("../utils/requestResponse.js");

class SearchService {
  search = async (payload) => {
    const data = await User.find({
      $or: [{ username: { $regex: payload } }],
    });
    return { ...requestResponse.success, data };
  };
}

module.exports = new SearchService();
