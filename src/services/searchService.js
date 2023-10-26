const User = require("../models/userModel");
const { requestResponse } = require("../utils/requestResponse.js");

class SearchService {
  search = async (payload) => {
    // console.log({ payload });
    const query =
      payload != "undefined" || !payload
        ? {
            $or: [{ area: { $regex: payload } }],
          }
        : {};
    const data = await User.find(query);
    return { ...requestResponse.success, data };
  };
}

module.exports = new SearchService();
