const jwt = require("jsonwebtoken");
require("dotenv").config();

function jwtGenerator(id) {
  const payload = {
    user: { id }
  };
  console.log('JWT Secret:', process.env.jwtSecret);
  return jwt.sign(payload, process.env.jwtSecret, { expiresIn: 3600 });
}

module.exports = jwtGenerator;