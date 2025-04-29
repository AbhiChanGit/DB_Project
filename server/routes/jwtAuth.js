const router = require("express").Router();
const db = require("../index");
const bcrypt = require("bcrypt");
const jwtGenerator = require("../utils/jwtGenerator");
const validInfo = require("../middleware/validinfo");
const authorization = require("../middleware/authorization");
const nodemailer = require("nodemailer");
const generateQRCode = require("../utils/qrcodeGenerator");
const send = require("send");

const userDataStorage = {};

const sendVerificationCode = async (email, code) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'luudang04@gmail.com',
            pass: 'begb lrfn rzfv pswu'
        },
    });

    const mailOptions = {
        from: 'luudang04@gmail.com',
        to: email,
        subject: 'Verification Code',
        text: `Your verification code is ${code}. It is valid in 10 minutes. Please do not share it with anyone. Thank you!`
    };
    return transporter.sendMail(mailOptions);
}

const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit code
}

const generateUsername = async(email) => {
    const usernameBase = email.split('@')[0]; // Get the part before the '@' in the email
    let username = usernameBase;
    let counter = 1;

    // Check if the username already exists in the database
    const checkUsernameExists = async (username) => {
        const result = await db.query("SELECT * FROM users WHERE username = $1", [username]);
        return result.rows.length > 0;
    };

    // Generate a unique username by appending a number if necessary
    while (await checkUsernameExists(username)) {
        username = `${usernameBase}${counter}`;
        counter++;
    }
    return username;
}

//login
router.post("/login", validInfo, async (req, res) => {
    const {email, password, user_type} = req.body;
    try {
        const user = await db.query("SELECT * FROM users WHERE email = $1 AND user_type = $2", [email, user_type]);
        if (user.rows.length === 0) {
            return res.status(401).json({status: "fail", message: "Invalid credentials"});
        }
        const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
        if (!validPassword) {
            return res.status(401).json({status: "fail", message: "Invalid credentials"});
        }
        const jwToken = jwtGenerator(user.rows[0].user_id);
        return res.json({jwToken});
    } catch (err) {
        console.error(err.message);
        return res.status(500).json({status: "fail", message: "Server error"});
    }
})

//sign up
router.post("/signup", validInfo, async(req, res) => {
    const {first_name, last_name, phone, email, password, user_type, salary, job_title, hire_date} = req.body;
    try{
        const exist = await db.query("SELECT * FROM users WHERE email = $1",
            [email]
        )
        if (exist.rows.length > 0) {
            return res.status(401).json({status: "fail", message: "User already exists"});
        } else {
            const saltRound = 10;
            const salt = await bcrypt.genSalt(saltRound);
            const bcryptPassword = await bcrypt.hash(password, salt);
            let username = await generateUsername(email);
            let verificationCode = generateVerificationCode();
            await sendVerificationCode(email, verificationCode);
            userDataStorage[email] = {
                first_name,
                last_name,
                phone,
                email,
                password: bcryptPassword,
                user_type,
                username,
                salary,
                job_title,
                hire_date,
                verificationCode
            };
            await db.query("DELETE FROM verifying WHERE email = $1", [email]); // Clean up any previous entries
            const verifying = await db.query("INSERT INTO verifying (email, code) VALUES ($1, $2) RETURNING *", [email, verificationCode]);
            return res.json({
                status: "success",
                message: "Verification code sent to your email and valid in 10 minutes. Please verify your account.",
            })
        }
    } catch(err) {
        console.error(err.message);
        return res.status(500).json({status: "fail", message: "Server error"});
    }
})

//verify email for sign up
router.post("/verify-signup", async(req, res) => {
    const {email, code} = req.body;
    try{
        const userData = userDataStorage[email];
        if (!userData) {
            return res.status(400).json({status: "fail", message: "No sign-up data found for this email."});
        }
        const result = await db.query("SELECT * FROM verifying WHERE email = $1 AND code = $2", [email, code]);
        if (result.rows.length > 0) {
            const response = await db.query(
                "INSERT INTO users (username, password_hash, email, user_type) VALUES ($1, $2, $3, $4) RETURNING *",
                [userData.username, userData.password, userData.email, userData.user_type]
            )
            const userID = response.rows[0].user_id;
            const userType = response.rows[0].user_type;
            if (userType === 'customer') {
                await db.query(
                    "INSERT INTO customers (user_id, first_name, last_name, phone) VALUES ($1, $2, $3, $4)",
                    [userID, userData.first_name, userData.last_name, userData.phone]
                );
            } else if (userType === 'staff') {
                await db.query(
                    "INSERT INTO staff (user_id, first_name, last_name, phone, salary, job_title, hire_date) VALUES ($1, $2, $3, $4, $5, $6, $7)",
                    [userID, userData.first_name, userData.last_name, userData.phone, userData.salary, userData.job_title, userData.hire_date]
                );
            }
            console.log(response.rows[0]);
            const jwToken = jwtGenerator(response.rows[0].user_id);
            delete userDataStorage[email]; // Clean up the stored data after successful registration
            return res.json({jwToken});
        } else {
            return res.status(400).json({status: "fail", message: "Invalid verification code."});
        }
    } catch(err) {
        console.error(err.message);
        return res.status(500).json({status: "fail", message: "Server error"});
    }
})

//forgot password
router.post("/forgot-password", validInfo, async(req, res) => {
    const {email, password} = req.body;
    try {
        const exist = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        if (exist.rows.length === 0) {
            return res.status(401).json({
                status: "fail",
                message: "Email does not exist"
            })
        } else {
            const saltRound = 10;
            const salt = await bcrypt.genSalt(saltRound);
            const bcryptPassword = await bcrypt.hash(password, salt);
            userDataStorage[email] = {
                email,
                password: bcryptPassword
            };
            await db.query("DELETE FROM verifying WHERE email = $1", [email]);
            let verificationCode = generateVerificationCode();
            await sendVerificationCode(email, verificationCode);
            await db.query("INSERT INTO verifying (email, code) VALUES ($1, $2) RETURNING *", [email, verificationCode]);
            return res.json({
                status: "success",
                message: "Verification Code Sent"
            });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            status: "fail",
            message: "Internal Server Error"
        })
    }
})

//verify email for forgot password
router.put("/verify-forgot-password", async(req, res) => {
    const {email, code} = req.body;
    try {
        const userData = userDataStorage[email];
        if (!userData) {
            return res.status(400).json({status: "fail", message: "No forgot password data found for this email."});
        }
        const result = await db.query("SELECT * FROM verifying WHERE email = $1 AND code = $2", [email, code]);
        if (result.rows.length > 0) {
            const response = await db.query(
                "UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING *",
                [userData.password, userData.email]
            );
            delete userDataStorage[email]; // Clean up the stored data after successful password reset
            if (response.rows.length === 0) {
                return res.status(400).json({status: "fail", message: "Failed to update password."});
            }
            return res.json({
                status: "success",
                message: "Password updated successfully."
            });
        } else {
            return res.status(400).json({status: "fail", message: "Invalid verification code."});
        }
    } catch (err) {
        console.error(err.message);
        return res.status(500).json({status: "fail", message: "Server error"});
    }
})


router.get("/is-verify", authorization, async (req, res) => {
    try{
        res.json(true);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            status: "fail",
            message: "Internal Server Error"
        })
    }
})

module.exports = router;