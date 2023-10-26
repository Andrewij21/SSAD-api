const searchService = require("../services/searchService");
// const checkIfEmpty = require("../utils/checkIfEmpty");
const checkResponse = require("../utils/checkResponse");

let response;
class DeviceControllers {
  async searchItem(req, res) {
    try {
      const data = await searchService.search(req.query.q);
      response = data;
    } catch (error) {
      response = error;
    }
    checkResponse(res, response, __filename);
  }
}

module.exports = new DeviceControllers();
