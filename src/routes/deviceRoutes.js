const router = require("express").Router();
const deviceController = require("../controllers/deviceControllers");

router
  .route("/")
  .get(deviceController.getDevice)
  .post(deviceController.createDevice);

router.route("/user").post(deviceController.addUserToDevice);

router
  .route("/:id")
  .patch(deviceController.updateDevice)
  .delete(deviceController.deleteDevice);
module.exports = router;
