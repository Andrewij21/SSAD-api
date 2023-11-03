const locationService = require("../services/locationServices");
// const checkIfEmpty = require("../utils/checkIfEmpty");
const checkResponse = require("../utils/checkResponse");

let response;
class LocationControllers {
  async getDeviceLocation(req, res) {
    try {
      const data = await locationService.getDevice();
      response = data;
    } catch (error) {
      response = error;
    }
    checkResponse(res, response, __filename);
  }
}

module.exports = new LocationControllers();
