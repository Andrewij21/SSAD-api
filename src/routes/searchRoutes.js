const router = require("express").Router();
const searchControllers = require("../controllers/searchControllers");

router.route("/:key").get(searchControllers.searchItem);

module.exports = router;
