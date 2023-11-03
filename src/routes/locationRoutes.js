const router = require("express").Router();
const locationControllers = require("../controllers/locationControllers");

router.route("/").get((req, res) => {
  res.sendStatus(200);
});
router.route("/device").get(locationControllers.getDeviceLocation);

module.exports = router;
