const router = require("express").Router();
const deviceRoutes = require("./deviceRoutes");
const userRoutes = require("./userRoutes");
const authRoutes = require("./authRoutes");
const registerRoutes = require("./registerRoutes");
const searchRoutes = require("./searchRoutes");
const locationRoutes = require("./locationRoutes");
// const refreshTokenRoutes = require("./refreshTokenRoutes");
const verifyJwt = require("../middlewares/verifyJwt");
// const verifyRoles = require("../middlewares/verifyRoles");
// const ROLES = require("../config/rolesLists");

router.get("/", (req, res) => {
  res.sendStatus(200);
});

router.use("/auth", authRoutes);
router.use("/register", registerRoutes);

router.use(verifyJwt);
// router.use("/search", searchRoutes); //turn off for now
router.use("/device", deviceRoutes);
router.use("/location", locationRoutes);
router.use("/user", userRoutes);

module.exports = router;
