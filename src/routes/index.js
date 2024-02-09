// User Client Routes
const router = require("express").Router();
const deviceRoutes = require("./deviceRoutes");
const userRoutes = require("./userRoutes");
const authRoutes = require("./authRoutes");
const registerRoutes = require("./registerRoutes");
const searchRoutes = require("./searchRoutes");
const locationRoutes = require("./locationRoutes");

// Device Client Routes
const deviceController = require("../controllers/deviceControllers");

// Middleware
const verifyJwt = require("../middlewares/verifyJwt");

// Health Check _API
router.get("/", (req, res) => {
  res.sendStatus(200);
});

// Device Client
router.use("/device/updateRPM", deviceController.updateDeviceRPM);

// User Client
router.use("/auth", authRoutes);
router.use("/register", registerRoutes);

// Security
router.use(verifyJwt);

router.use("/search", searchRoutes);
router.use("/device", deviceRoutes);
router.use("/location", locationRoutes);
router.use("/user", userRoutes);

module.exports = router;
