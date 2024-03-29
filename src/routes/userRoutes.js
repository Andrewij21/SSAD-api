const router = require("express").Router();
const userController = require("../controllers/userControllers");

router.route("/").get(userController.getUser).post(userController.createUser);

router.route("/count").get(userController.getUserCount);
router.route("/reset-password/:id").patch(userController.resetPasswordUser);
router
  .route("/device")
  .patch(userController.addUserDevice)
  .delete(userController.removeUserDevice);

router
  .route("/:id")
  .get(userController.findUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);
module.exports = router;
