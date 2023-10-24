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

// use cookie-parser
app.use(cookieParser());

// Accept cors
app.use(
  cors({
    origin: (origin, callback) => {
      // if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      logger.info(`Access granted for origin ${origin}`);
      callback(null, true);
      // } else {
      //   logger.error(`Access denied for origin ${origin}`);
      //   callback(null, false);
      // }
    },
    optionsSuccessStatus: 200,
    credentials: true,
  })
);

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
