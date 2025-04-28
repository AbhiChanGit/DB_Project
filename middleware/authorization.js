const jwt = require("jsonwebtoken");
require("dotenv").config();


module.exports = async (req, res, next) => {
    try {
        const jwToken = req.header("token");
        if (!jwToken) {
            return res.status(403).json({
                status: "fail",
                message: "Authorization denied"
            });
        }
        const payload = jwt.verify(jwToken, process.env.jwtSecret);
        req.customers = payload.customers;
        next();
    } catch (err) {
        console.error(err.message);
        return res.status(403).json({
            status: "fail",
            message: "Not Authorized"
        });
    }
}