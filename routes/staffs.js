const router = require("express").Router();
const db = require("../index");
const authorization = require("../middleware/authorization");

// update customer info
router.put("/customer_update", authorization, async(req, res) => {
    const {email, password, phone, job_title} = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        //Start transaction
        await db.query("BEGIN");
        //update users table
        await db.query("UPDATE users SET email = $1, password_hash = $2 WHERE user_id = $3", [email, hashedPassword, req.users.user_id]);
        //update staffs table
        await db.query("UPDATE staffs SET phone = $1, job_title = $2 WHERE customer_id = $3", [phone, job_title, req.staffs.user_id]);
        //Commit transaction
        await db.query("COMMIT");
        res.status(200).json({
            status: "success",
            message: "Customer info updated successfully"
        })
    } catch(err) {
        console.error(err.message);
        res.status(500).json({
            status: "fail",
            message: "Server Error"
        })
    }
})

// add product
router.post("/api/v1/products/:productId/create", authorization, async(req, res) => {
    const {productId} = req.params.productId;
    const {name, description, brand, size, image_url, price} = req.body;
    try {
        //Start transaction
        await db.query("BEGIN");
        //insert into products table
        await db.query("INSERT INTO products (product_id, name, description, brand, size, image_url, price) VALUES ($1, $2, $3, $4, $5, $6, $7)", [productId, name, description, brand, size, image_url, price]);
        //Commit transaction
        await db.query("COMMIT");
        res.status(200).json({
            status: "success",
            message: "Product added successfully"
        })
    } catch(err) {
        console.error(err.message);
        res.status(500).json({
            status: "fail",
            message: "Server Error"
        })
    }
})