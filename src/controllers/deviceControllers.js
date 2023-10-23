const deviceService = require("../services/deviceServices");
const checkIfEmpty = require("../utils/checkIfEmpty");
const checkResponse = require("../utils/checkResponse");

let response;
class DeviceControllers {
  async getDevice(req, res) {
    try {
      const data = await deviceService.get();
      response = data;
    } catch (error) {
      response = error;
    }
    checkResponse(res, response, __filename);
  }
  async getDeviceCount(req, res) {
    try {
      const data = await deviceService.getCount();
      response = data;
    } catch (error) {
      response = error;
    }
    checkResponse(res, response, __filename);
  }

  async createDevice(req, res) {
    const { name, user } = req.body;
    const check = checkIfEmpty({ name });
    if (check.status) {
      return res.status(400).json({ message: check.msg });
    }
    try {
      const data = await deviceService.create({
        name: name.trim(),
        user,
      });
      response = data;
    } catch (error) {
      response = error;
    }
    checkResponse(res, response, __filename);
  }
  async addUserToDevice(req, res) {
    const { id, user } = req.body;
    const check = checkIfEmpty({ user, id });
    if (check.status) {
      return res.status(400).json({ message: check.msg });
    }
    try {
      const data = await deviceService.addUser({
        user: user.trim(),
        id,
      });
      response = data;
    } catch (error) {
      response = error;
    }
    checkResponse(res, response, __filename);
  }

  async updateDevice(req, res) {
    try {
      const data = await deviceService.update(
        {
          ...req.body,
        },
        req.params.id
      );
      response = data;
    } catch (error) {
      response = error;
    }
    checkResponse(res, response, __filename);
  }
  async deleteDevice(req, res) {
    try {
      const data = await deviceService.delete(req.params.id);
      response = data;
    } catch (error) {
      response = error;
    }
    checkResponse(res, response, __filename);
  }
}

module.exports = new DeviceControllers();
