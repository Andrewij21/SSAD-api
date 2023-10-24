require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/mongoDB");
const getLogger = require("./utils/logger");
const routes = require("./routes");
const logger = getLogger(__filename);

const PORT = process.env.PORT || 3000;

// Accept JSON
app.use(express.json());

// Accept cors
app.use(cors());

// use cookie-parser
app.use(cookieParser());

// Use all routes
app.use("/api/v1/", routes);

connectDB
  .then(() => {
    app.listen(PORT, () =>
      logger.info(`Listening on http://localhost:${PORT}`)
    );
  })
  .catch((e) => {
    logger.error(e.toString());
  });
