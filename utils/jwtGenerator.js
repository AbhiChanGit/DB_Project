const jwt = require("jsonwebtoken");
require("dotenv").config();


function jwtGenerator(id) {
    const payload = {
        customers: {
            id
        }
    }

    return jwt.sign(payload, process.env.jwtSecret, { expiresIn: 3600 });
}

module.exports = jwtGenerator;