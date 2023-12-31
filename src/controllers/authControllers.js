const authService = require("../services/authServices");
const checkIfEmpty = require("../utils/checkIfEmpty");
const checkResponse = require("../utils/checkResponse");

let response;
class AuthControllers {
  async login(req, res) {
    const { username, password } = req.body;
    const check = checkIfEmpty({ username, password });
    if (check.status) {
      return res.status(400).json({ message: check.msg });
    }
    try {
      // LOGIN LOGIC
      const { data, refreshToken } = await authService.create({
        username: username.trim(),
        password: password.trim(),
      });
      response = data;

      // ADD REFRESH TOKEN
      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        sameSite: "None",
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
    } catch (error) {
      response = error;
    }
    checkResponse(res, response, __filename);
  }
  async refreshToken(req, res) {
    const cookies = req.cookies;
    if (!cookies.jwt) return res.status(401).json({ message: "Null token" });

    try {
      const data = await authService.refreshToken(cookies.jwt);
      response = data;
    } catch (error) {
      response = error;
    }
    checkResponse(res, response, __filename);
  }
  async logout(req, res) {
    try {
      const cookies = req.cookies;
      // 204 MEANS SERVER FULFILLED THE REQUEST AND NO ADDITIONAL PAYLOAD RESPONSE
      if (!cookies.jwt) return res.sendStatus(204);
      const data = await authService.delete(cookies.jwt);
      response = data;

      // REMOVE COOKIE FROM SESSION STORAGE
      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "None",
        secure: true,
      });
    } catch (error) {
      response = error;
    }
    checkResponse(res, response, __filename);
  }

  // async forgetpassword(req, res) {
  //   try {
  //     const data = await authService.forgetPassword(req.body.email);
  //     response = data;
  //   } catch (error) {
  //     response = error;
  //   }
  //   checkResponse(res, response, __filename);
  // }
}

module.exports = new AuthControllers();
