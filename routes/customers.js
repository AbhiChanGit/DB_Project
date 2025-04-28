const router = require("express").Router();
const db = require("../index");
const authorization = require("../middleware/authorization");

//check if customer is authorized
router.get("/customer", authorization, async(req, res) => {
    try {
        const users = await db.query("Select * from users where user_id = $1 AND user_type = $2", [req.users.user_id, "customer"]);
        if (users.rows.length > 0) {
            res.json(users.rows[0]);
        } else {
            res.status(404).json({
                status: "fail",
                message: "Unauthorized"
            })
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            status: "fail",
            message: "Server Error"
        })
    }
})

// update customer info
router.put("/customer_update", authorization, async(req, res) => {
    const {email, password, phone} = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        //Start transaction
        await db.query("BEGIN");
        //update users table
        await db.query("UPDATE users SET email = $1, password_hash = $2 WHERE user_id = $3", [email, hashedPassword, req.users.user_id]);
        //update customer table
        await db.query("UPDATE customers SET phone_number = $1 WHERE customer_id = $2", [phone, req.customers.user_id]);
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

//create credit card info
router.post("/credit_card_create", authorization, async(req, res) => {
    const {card_number, card_holder_name, expiry_date, cvv, billing_address_id, is_default} = req.body;
    try {
        await db.query("BEGIN");
        //insert credit card info
        await db.query("INSERT INTO credit_card (customer_id, card_number, card_holder_name, expiry_date, cvv, billing_address_id, is_default) VALUES ($1, $2, $3, $4, $5, $6, $7)", 
            [req.customers.customer_id, card_number, card_holder_name, expiry_date, cvv, billing_address_id, is_default]);
        //Commit transaction
        await db.query("COMMIT");
        res.status(200).json({
            status: "success",
            message: "Credit card info created successfully"
        })
    } catch(err) {
        console.error(err.message);
        res.status(500).json({
            status: "fail",
            message: "Server Error"
        })
    }
})

// update credit card info
router.put("/credit_card_update", authorization, async(req, res) => {
    const {card_number, card_holder_name, expiry_date, cvv, billing_address_id, is_default} = req.body;
    try {
        await db.query("BEGIN");
        //update credit card info
        await db.query("UPDATE credit_card SET card_number = $1, card_holder_name = $2, expiry_date = $3, cvv = $4, billing_address_id = $5, is_default = $6 WHERE customer_id = $7 AND card_id = $8", 
            [card_number, card_holder_name, expiry_date, cvv, billing_address_id, is_default, req.customers.customer_id, req.credit_cards.card_id]);
        //Commit transaction
        await db.query("COMMIT");
        res.status(200).json({
            status: "success",
            message: "Credit card info updated successfully"
        })
    } catch(err) {
        console.error(err.message);
        res.status(500).json({
            status: "fail",
            message: "Server Error"
        })
    }
})

// delete credit card info
router.delete("/credit_card_delete", authorization, async(req, res) => {
    try {
        await db.query("BEGIN");
        //delete credit card info
        await db.query("DELETE FROM credit_card WHERE customer_id = $1 AND card_id = $2", [req.customers.customerr_id, req.credit_cards.card_id]);
        //Commit transaction
        await db.query("COMMIT");
        res.status(200).json({
            status: "success",
            message: "Credit card info deleted successfully"
        })
    } catch(err) {
        console.error(err.message);
        res.status(500).json({
            status: "fail",
            message: "Server Error"
        })
    }
})

// get all credit cards
router.get("/credit_cards", authorization, async(req, res) => {
    try {
        const credit_cards = await db.query("SELECT * FROM credit_card WHERE customer_id = $1", [req.customers.customer_id]);
        if (credit_cards.rows.length > 0) {
            res.json(credit_cards.rows);
        } else {
            res.status(404).json({
                status: "fail",
                message: "No credit cards found"
            })
        }
    } catch(err) {
        console.error(err.message);
        res.status(500).json({
            status: "fail",
            message: "Server Error"
        })
    }
})

// create new address
router.post("/address_create", authorization, async(req, res) => {
    const {address_type, street_address, city, state, postal_code, country, is_default} = req.body;
    try {
        await db.query("BEGIN");
        //insert address info
        await db.query("INSERT INTO address (user_id, address_type, street_address, city, state, postal_code, country, is_default) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)", 
            [req.users.user_id, address_type, street_address, city, state, postal_code, country, is_default]);
        //Commit transaction
        await db.query("COMMIT");
        res.status(200).json({
            status: "success",
            message: "Address created successfully"
        })
    } catch(err) {
        console.error(err.message);
        res.status(500).json({
            status: "fail",
            message: "Server Error"
        })
    }
})

// update address info
router.put("/address_update", authorization, async(req, res) => {
    const {address_type, street_address, city, state, postal_code, country, is_default} = req.body;
    try {
        await db.query("BEGIN");
        //update address info
        await db.query("UPDATE address SET address_type = $1, street_address = $2, city = $3, state = $4, postal_code = $5, country = $6, is_default = $7 WHERE user_id = $8 AND address_id = $9", 
            [address_type, street_address, city, state, postal_code, country, is_default, req.users.user_id, req.addresses.address_id]);
        //Commit transaction
        await db.query("COMMIT");
        res.status(200).json({
            status: "success",
            message: "Address updated successfully"
        })
    } catch(err) {
        console.error(err.message);
        res.status(500).json({
            status: "fail",
            message: "Server Error"
        })
    }
})

// delete address info
router.delete("/address_delete", authorization, async(req, res) => {
    try {
        await db.query("BEGIN");
        //delete address info
        await db.query("DELETE FROM address WHERE user_id = $1 AND address_id = $2", [req.users.user_id, req.addresses.address_id]);
        //Commit transaction
        await db.query("COMMIT");
        res.status(200).json({
            status: "success",
            message: "Address deleted successfully"
        })
    } catch(err) {
        console.error(err.message);
        res.status(500).json({
            status: "fail",
            message: "Server Error"
        })
    }
})

// get all addresses
router.get("/addresses", authorization, async(req, res) => {
    try {
        const addresses = await db.query("SELECT * FROM address WHERE user_id = $1", [req.users.user_id]);
        if (addresses.rows.length > 0) {
            res.json(addresses.rows);
        } else {
            res.status(404).json({
                status: "fail",
                message: "No addresses found"
            })
        }
    } catch(err) {
        console.error(err.message);
        res.status(500).json({
            status: "fail",
            message: "Server Error"
        })
    }
})

// get all products
router.get("/products", authorization, async(req, res) => {
    try {
        const products = await db.query("SELECT * FROM product");
        if (products.rows.length > 0) {
            res.json(products.rows);
        } else {
            res.status(404).json({
                status: "fail",
                message: "No products found"
            })
        }
    } catch(err) {
        console.error(err.message);
        res.status(500).json({
            status: "fail",
            message: "Server Error"
        })
    }
})

// search for products
router.get("/api/v1/search_product", authorization, async(req, res) => {
    try {
        const {search} = req.query;
        const products = await db.query(
            "SELECT * FROM product WHERE name ILIKE $1 OR brand ILIKE $1 OR product_type ILIKE $1",
            [`%${search}%`]
        );
        res.json(products.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            status: "fail",
            message: "Server Error"
        })
    }
})

//create shopping cart
router.post("/shopping_cart_create", authorization, async(req, res) => {
    try {
        await db.query("BEGIN");
        //insert shopping cart info
        await db.query("INSERT INTO sho pping_carts (customer_id) VALUES ($1)", [req.customers.customer_id]);
        //Commit transaction
        await db.query("COMMIT");
        res.status(200).json({
            status: "success",
            message: "Shopping cart created successfully"
        })
    } catch(err) {
        console.error(err.message);
        res.status(500).json({
            status: "fail",
            message: "Server Error"
        })
    }
})

// add product to cart
router.post("/api/v1/cart/:product_id/add", authorization, async(req, res) => {
    const {product_id} = req.params.product_id
    const {quantity} = req.body;
    try {
        await db.query("BEGIN");

        //check if product is available in stock
        const stockCheck = await db.query("SELECT SUM(quantity) AS total_quantity FROM stock WHERE product_id = $1", [product_id]);

        const totalStock = parseInt(stockCheck.rows[0].total_quantity) || 0;

        if (totalStock < quantity) {
            await db.query("ROLLBACK");
            return res.status(400).json({
                status: "fail",
                message: "Not enough quantity available"
            })
        }

        //insert product to cart
        await db.query("INSERT INTO cart_items (customer_id, product_id, quantity) VALUES ($1, $2, $3)", 
            [req.customers.customer_id, product_id, quantity]);
        //Commit transaction
        await db.query("COMMIT");
        res.status(200).json({
            status: "success",
            message: "Product added to shopping cart successfully"
        })
    } catch(err) {
        console.error(err.message);
        res.status(500).json({
            status: "fail",
            message: "Server Error"
        })
    }
})

// change quantity of product in cart
router.put("/api/v1/cart/:product_id/update", authorization, async(req, res) => {
    const {product_id} = req.params.product_id
    const {quantity} = req.body;
    try {
        await db.query("BEGIN");
        //update product in cart
        await db.query("UPDATE cart_items SET quantity = $1 WHERE customer_id = $2 AND product_id = $3", 
            [quantity, req.customers.customer_id, product_id]);
        //Commit transaction
        await db.query("COMMIT");
        res.status(200).json({
            status: "success",
            message: "Product quantity updated successfully"
        })
    } catch(err) {
        console.error(err.message);
        res.status(500).json({
            status: "fail",
            message: "Server Error"
        })
    }
})

// remove product from cart
router.delete("/api/v1/cart/:product_id/remove", authorization, async(req, res) => {
    const {product_id} = req.params.product_id
    try {
        await db.query("BEGIN");
        //delete product from cart
        await db.query("DELETE FROM cart_items WHERE customer_id = $1 AND product_id = $2", [req.customers.customer_id, product_id]);
        //Commit transaction
        await db.query("COMMIT");
        res.status(200).json({
            status: "success",
            message: "Product removed from shopping cart successfully"
        })
    } catch(err) {
        console.error(err.message);
        res.status(500).json({
            status: "fail",
            message: "Server Error"
        })
    }
})

// get all products in cart
router.get("/api/v1/cart", authorization, async(req, res) => {
    try {
        const cart_items = await db.query("SELECT * FROM cart_items WHERE customer_id = $1", [req.customers.customer_id]);
        if (cart_items.rows.length > 0) {
            res.json(cart_items.rows);
        } else {
            res.status(404).json({
                status: "fail",
                message: "No products found in shopping cart"
            })
        }
    } catch(err) {
        console.error(err.message);
        res.status(500).json({
            status: "fail",
            message: "Server Error"
        })
    }
})

//create order
router.post("/order/create", authorization, async(req, res) => {
    try{
        await db.query("BEGIN");
        // get all cart items
        const cartItemsResult = await db.query(
            "SELECT ci.product_id, ci.quantity, pp.price FROM cart_items ci JOIN product_prices pp ON ci.product_id = pp.product_id WHERE ci.cart_id = (SELECT cart_id FROM shopping_carts WHERE customer_id = $1) AND pp.end_date IS NULL",
            [req.customers.customer_id]
        )
        const cartItems = cartItemsResult.rows;
        if (cartItems.length === 0) {
            await db.query("ROLLBACK");
            return res.status(400).json({
                status: "fail",
                message: "No items in cart"
            })
        }

        // calculate total price
        let total_price = 0;
        for (let item of cartItems) {
            total_price += item.price * item.quantity;
        }

        //create order
        const newOrder = await db.query(
            "INSERT INTO orders (customer_id, status, credit_card_id, total_amount) VALUES ($1, 'issued', $2, $3) RETURNING order_id",
            [req.customers.customer_id, req.credit_cards.ccard_id, total_price]
        );
        const order_id = newOrder.rows[0].order_id;

        //check product available in which stock
        const warehoudeID = await db.query(
            "SELECT warehouse_id FROM stock WHERE product_id = $1 AND quantity > 0", [product_id]
        );

        //insert order items
        for (let item of cartItems) {
            await db.query(
                "INSERT INTO order_items (order_id, product_id, quantity, unit_price, warehouse_id) VALUES ($1, $2, $3, $4, $5)",
                [order_id, item.product_id, item.quantity, total_price, warehoudeID.rows[0].warehouse_id]
            )
        }

        //update stock quantity
        for (let item of cartItems) {
            await db.query(
                "UPDATE stock SET quantity = quantity - $1 WHERE product_id = $2 AND warehouse_id = $3 AND quantity >= $1",
                [item.quantity, item.product_id, warehoudeID.rows[0].warehouse_id]
            )
        }

        //clear shopping cart\
        await db.query(
            "DELETE FROM cart_items WHERE cart_id = (SELECT cart_id FROM shopping_carts WHERE customer_id = $1)",
            [req.customers.customer_id]
        );
        await db.query("COMMIT");
        res.status(200).json({
            status: "success",
            message: "Order created successfully",
            order_id: order_id
        })
    } catch(err) {
        await db.query("ROLLBACK");
        console.error(err.message);
        res.status(500).json({
            status: "fail",
            message: "Server Error"
        });
    }
});

//update order status
router.put("/order_update/:orderId", authorization, async(req, res) => {
    const {orderId} = req.params;
    const {status, delivery_type} = req.body;
    try {
        await db.query("BEGIN");
        //update order status
        await db.query(
            "UPDATE orders SET status = $1 WHERE order_id = $2 AND customer_id = $3",
            [status, orderId, req.customers.customer_id]
        );

        //delete if status is cancelled or delivered
        if (status === 'cancelled' || status === 'delivered') {
            await db.query(
                "DELETE FROM order_items WHERE order_id = $1",
                [orderId]
            );
            //delete delivery plan if exists
            await db.query(
                "DELETE FROM delivery_plans WHERE order_id = $1",
                [orderId]
            );
        }

        //create delivery plan if status is processing
        if (status === 'processing') {
            const deliveryPlan = await db.query(
                "INSERT INTO delivery_plans (order_id, delivery_type, delivery_price, ship_date, delivery_date, tracking_number) VALUES ($1, $2, $3, NOW(), NOW() + INTERVAL '5 days', $4) RETURNING delivery_plan_id",
                [orderId, delivery_type, 5.00, `TRACK-${orderId}`]
            )
        }

        //Commit transaction
        await db.query("COMMIT");
        res.status(200).json({
            status: "success",
            message: "Order status updated successfully"
        })
    } catch(err) {
        await db.query("ROLLBACK");
        console.error(err.message);
        res.status(500).json({
            status: "fail",
            message: "Server Error"
        })
    }
})

//get all order
router.get("/orders", authorization, async(req, res) => {
    try {
        const orders = await db.query("SELECT * FROM orders WHERE customer_id = $1", [req.customers.customer_id]);
        if (orders.rows.length > 0) {
            res.json(orders.rows);
        } else {
            res.status(404).json({
                status: "fail",
                message: "No orders found"
            })
        }
    } catch(err) {
        console.error(err.message);
        res.status(500).json({
            status: "fail",
            message: "Server Error"
        })
    }
})


module.exports = router;