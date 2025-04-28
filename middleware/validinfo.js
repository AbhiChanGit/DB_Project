module.exports = async (req, res, next) => {
    const {first_name, middle_name, last_name, email, password, phone_number, type_of_user} = req.body;
    function validEmail(email) {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
    }
    if (req.path === "/signup") {
        if (![first_name, middle_name, last_name, email, password, phone_number, type_of_user].every(Boolean)) {
            return res.status(401).json({
                status: "fail",
                message: "Missing Credentials"
            });
        } else if (!validEmail(email)) {
            return res.status(401).json({
                status: "fail",
                message: "Invalid Email"
            });
        }
    } else if (req.path === "/login") {
        if (![email, password, type_of_user].every(Boolean)) {
            return res.status(401).json({
                status: "fail",
                message: "Missing Credentials"
            });
        } else if (!validEmail(email)) {
            return res.status(401).json({
                status: "fail",
                message: "Invalid Email"
            });
        }
    }
    next();
}