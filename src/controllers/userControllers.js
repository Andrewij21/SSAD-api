const userService = require("../services/userServices");
const checkIfEmpty = require("../utils/checkIfEmpty");
const checkResponse = require("../utils/checkResponse");

let response;
class UserControllers {
  async getUser(req, res) {
    try {
      const data = await userService.get();
      response = data;
    } catch (error) {
      response = error;
    }
    checkResponse(res, response, __filename);
  }
  async getUserCount(req, res) {
    try {
      const data = await userService.getCount();
      response = data;
    } catch (error) {
      response = error;
    }
    checkResponse(res, response, __filename);
  }
  async createUser(req, res) {
    const { username, password } = req.body;
    const check = checkIfEmpty({ username, password });
    if (check.status) {
      return res.status(400).json({ message: check.msg });
    }
    try {
      const data = await userService.create({
        username: username.trim(),
        password: password.trim(),
        ...req.body,
      });
      response = data;
    } catch (error) {
      response = error;
    }
    checkResponse(res, response, __filename);
  }
  async addUserDevice(req, res) {
    const { id, device } = req.body;
    // const check = checkIfEmpty({ username, password });
    // if (check.status) {
    //   return res.status(400).json({ message: check.msg });
    // }
    try {
      const data = await userService.addDevices({
        ...req.body,
      });
      response = data;
    } catch (error) {
      response = error;
    }
    checkResponse(res, response, __filename);
  }
  async removeUserDevice(req, res) {
    const { id, device } = req.body;
    const check = checkIfEmpty({ id, device });
    if (check.status) {
      return res.status(400).json({ message: check.msg });
    }
    try {
      const data = await userService.removeDevices({
        ...req.body,
      });
      response = data;
    } catch (error) {
      response = error;
    }
    checkResponse(res, response, __filename);
  }

  async updateUser(req, res) {
    const { username, password } = req.body;
    const check = checkIfEmpty({ username, password });
    if (check.status) {
      return res.status(400).json({ message: check.msg });
    }
    try {
      const data = await userService.update(
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
  async resetPasswordUser(req, res) {
    const { password } = req.body;
    const check = checkIfEmpty({ password });
    if (check.status) {
      return res.status(400).json({ message: check.msg });
    }
    try {
      const data = await userService.updatePassword(password, req.params.id);
      response = data;
    } catch (error) {
      response = error;
    }
    checkResponse(res, response, __filename);
  }
  async deleteUser(req, res) {
    try {
      const data = await userService.delete(req.params.id);
      response = data;
    } catch (error) {
      response = error;
    }
    checkResponse(res, response, __filename);
  }
}

module.exports = new UserControllers();
