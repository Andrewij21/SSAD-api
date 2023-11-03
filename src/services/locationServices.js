const { requestResponse } = require("../utils/requestResponse.js");
const Device = require("../models/deviceModel.js");
const getLogger = require("../utils/logger.js");
const fetch = require("node-fetch");
const logger = getLogger(__filename);

class LocationServices {
  async get({ lat, lng }) {
    return fetch(
      `${process.env.GEO_CODING_URI}?q=${lat}+${lng}&key=${process.env.GEO_CODING_API_KEY}`
    )
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        logger.info("Success get location");
        return {
          ...requestResponse.success,
          area: data.results[0].components,
          formatedLoc: data.results[0].formatted,
        };
      })
      .catch((err) => {
        throw { ...requestResponse.bad_request, error: err.status };
      });
  }

  async getDevice() {
    const data = await Device.find().select("area.latLong area.location name");

    logger.info(`Get ${data.length} device locations `);
    return { ...requestResponse.success, data };
  }
}

module.exports = new LocationServices();
