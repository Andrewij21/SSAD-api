const jwt = require("jsonwebtoken");

const verifyJWT = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Null token" });

  try {
    const { roles, username } = jwt.verify(
      token,
      process.env.SECRET_ACCESS_TOKEN
    );
    req.username = username;
    req.roles = roles;
    next();
  } catch (error) {
    res.status(403).json({ error: "Expired token" });
  }
};

module.exports = verifyJWT;
