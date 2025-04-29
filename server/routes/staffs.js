const router = require("express").Router();
const db = require("../index");
const authorization = require("../middleware/authorization");

// update staff info
router.put("/staff_update", authorization, async(req, res) => {
    const {email, password, phone, job_title} = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        //Start transaction
        await db.query("BEGIN");
        //update users table
        await db.query("UPDATE users SET email = $1, password_hash = $2 WHERE user_id = $3", [email, hashedPassword, req.users.user_id]);
        //update staffs table
        await db.query("UPDATE staffs SET phone = $1, job_title = $2 WHERE staff_id = $3", [phone, job_title, req.staffs.user_id]);
        //Commit transaction
        await db.query("COMMIT");
        res.status(200).json({
            status: "success",
            message: "staff info updated successfully"
        })
    } catch(err) {
        console.error(err.message);
        res.status(500).json({
            status: "fail",
            message: "Server Error"
        })
    }
})

//update customers' order status
router.put("/order_update/:orderId", authorization, async(req, res) => {
    const {orderId} = req.params;
    const {status} = req.body;
    try {
        await db.query("BEGIN");
        //update order status
        await db.query(
            "UPDATE orders SET status = $1 WHERE order_id = $2",
            [status, orderId]
        );

        //delete if status is cancelled or delivered
        if (status === 'cancelled' || status === 'delivered') {
            //return the money if status is cancelled
            if (status === 'cancelled') {
                const orderResult = await db.query(
                    "SELECT customer_id, total_amount FROM orders WHERE order_id = $1",
                    [orderId]
                );

                if (orderResult.rowCount > 0) {
                    const { customer_id, total_amount } = orderResult.rows[0];
                    // Update customer's balance
                    await db.query(
                        "UPDATE customers SET account_balance = account_balance - $1 WHERE customer_id = $2",
                        [total_amount, customer_id]
                    );
                }

                //update stock quantity
                const orderItemsResult = await db.query(
                    "SELECT product_id, quantity FROM order_items WHERE order_id = $1",
                    [orderId]
                )
                const orderItems = orderItemsResult.rows;
                for (let item of orderItems) {
                    const stockResult = await db.query(
                        "UPDATE stock SET quantity = quantity + $1 WHERE product_id = $2",
                        [item.quantity, item.product_id]
                    )
                }
            }
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

//add address
router.post("/:staffId/address/create", authorization, async(req, res) => {
    const {staffId} = req.params;
    const {street_address, city, state, postal_code, country} = req.body;
    try {
        //Start transaction
        await db.query("BEGIN");
        //insert into addresses table
        await db.query("INSERT INTO addresses (user_id, address_type, street_address, city, state, postal_code, country) VALUES ($1, $2, $3, $4, $5, $6, $7)", 
            [staffId, 'shipping', street_address, city, state, postal_code, country]);
        //Commit transaction
        await db.query("COMMIT");
        res.status(200).json({
            status: "success",
            message: "Address added successfully"
        })
    } catch(err) {
        console.error(err.message);
        res.status(500).json({
            status: "fail",
            message: "Server Error"
        })
    }
})

//edit address
router.put("/:staffId/address/:addressId/update", authorization, async(req, res) => {
    const {staffId, addressId} = req.params;
    const {street_address, city, state, postal_code, country} = req.body;
    try {
        //Start transaction
        await db.query("BEGIN");
        //update addresses table
        await db.query("UPDATE addresses SET street_address = $1, city = $2, state = $3, postal_code = $4, country = $5 WHERE address_id = $6 AND user_id = $7", 
            [street_address, city, state, postal_code, country, addressId, staffId]);
        //Commit transaction
        await db.query("COMMIT");
        res.status(200).json({
            status: "success",
            message: "Address updated successfully"
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

//delete address
router.delete("/:staffId/address/:addressId/delete", authorization, async(req, res) => {
    const {staffId, addressId} = req.params;
    try {
        //Start transaction
        await db.query("BEGIN");
        //delete from addresses table
        await db.query("DELETE FROM addresses WHERE address_id = $1 AND user_id = $2", [addressId, staffId]);
        //Commit transaction
        await db.query("COMMIT");
        res.status(200).json({
            status: "success",
            message: "Address deleted successfully"
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

//add warehouse
router.post("/:staffId/warehouse/create", authorization, async(req, res) => {
    const {staffId} = req.params;
    const {name, address_id, capacity} = req.body;
    try {
        //Start transaction
        await db.query("BEGIN");
        //insert into warehouses table
        await db.query("INSERT INTO warehouses (name, address_id, capacity) VALUES ($1, $2, $3)", [name, address_id, capacity]);
        //Commit transaction
        await db.query("COMMIT");
        res.status(200).json({
            status: "success",
            message: "Warehouse added successfully"
        })
    } catch(err) {
        console.error(err.message);
        res.status(500).json({
            status: "fail",
            message: "Server Error"
        })
    }
})

//edit warehouse
router.put("/:staffId/warehouse/:warehouseId/update", authorization, async(req, res) => {
    const {staffId, warehouseId} = req.params;
    const {name, address_id, capacity} = req.body;
    try {
        //Start transaction
        await db.query("BEGIN");
        //update warehouses table
        await db.query("UPDATE warehouses SET name = $1, address_id = $2, capacity = $3 WHERE warehouse_id = $4", [name, address_id, capacity, warehouseId]);
        //Commit transaction
        await db.query("COMMIT");
        res.status(200).json({
            status: "success",
            message: "Warehouse updated successfully"
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

// delete warehouse
router.delete("/:staffId/warehouse/:warehouseId/delete", authorization, async(req, res) => {
    const {staffId, warehouseId} = req.params;
    try {
        //Start transaction
        await db.query("BEGIN");
        //delete from warehouses table
        await db.query("DELETE FROM warehouses WHERE warehouse_id = $1", [warehouseId]);
        //Commit transaction
        await db.query("COMMIT");
        res.status(200).json({
            status: "success",
            message: "Warehouse deleted successfully"
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

//add category
router.post("/:staffId/categories/create", authorization, async(req, res) => {
    const {name, description} = req.body;
    try {
        //Start transaction
        await db.query("BEGIN");
        //insert into categories table
        await db.query("INSERT INTO categories (name, description) VALUES ($1, $2)", [name, description]);
        //Commit transaction
        await db.query("COMMIT");
        res.status(200).json({
            status: "success",
            message: "Category added successfully"
        })
    } catch(err) {
        console.error(err.message);
        res.status(500).json({
            status: "fail",
            message: "Server Error"
        })
    }
})

//edit category
router.put("/:staffId/categories/:categoryId/update", authorization, async(req, res) => {
    const {categoryId} = req.params;
    const {name, description} = req.body;
    try {
        //Start transaction
        await db.query("BEGIN");
        //update categories table
        await db.query("UPDATE categories SET name = $1, description = $2 WHERE category_id = $3", [name, description, categoryId]);
        //Commit transaction
        await db.query("COMMIT");
        res.status(200).json({
            status: "success",
            message: "Category updated successfully"
        })
    } catch(err) {await db.query("ROLLBACK");
        console.error(err.message);
        res.status(500).json({
            status: "fail",
            message: "Server Error"
        })
    }
})

// delete category
router.delete("/:staffId/categories/:categoryId/delete", authorization, async(req, res) => {
    const {categoryId} = req.params;
    try {
        //Start transaction
        await db.query("BEGIN");
        //delete from categories table
        await db.query("DELETE FROM categories WHERE category_id = $1", [categoryId]);
        //Commit transaction
        await db.query("COMMIT");
        res.status(200).json({
            status: "success",
            message: "Category deleted successfully"
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

// add product and price and stock
router.post("/:staffId/products/create", authorization, async (req, res) => {
    const { staffId } = req.params;
    const { name, description, brand, size, category_id, price, product_type, warehouse_id, quantity } = req.body;

    try {
        // Start transaction
        await db.query("BEGIN");

        // Fetch warehouse current usage and capacity first
        const warehouseResult = await db.query(
            "SELECT current_usage, capacity FROM warehouses WHERE warehouse_id = $1",
            [warehouse_id]
        );

        if (warehouseResult.rowCount === 0) {
            throw new Error("Warehouse not found");
        }

        const { current_usage, capacity } = warehouseResult.rows[0];
        const newUsage = current_usage + quantity;

        // Check if new usage exceeds capacity BEFORE any inserts
        if (newUsage > capacity) {
            await db.query("ROLLBACK");
            return res.status(400).json({
                status: "fail",
                message: "Warehouse capacity exceeded. Please retry with a lower quantity."
            });
        }

        // Insert into products table
        const productResult = await db.query(
            "INSERT INTO products (name, description, category_id, brand, product_type, size) VALUES ($1, $2, $3, $4, $5, $6) RETURNING product_id",
            [name, description, category_id, brand, product_type, size]
        );
        const productId = productResult.rows[0].product_id;

        // Insert into product_prices table
        await db.query(
            "INSERT INTO product_prices (product_id, price, set_by_staff_id) VALUES ($1, $2, $3)",
            [productId, price, staffId]
        );

        // Insert into stock table
        await db.query(
            "INSERT INTO stock (product_id, warehouse_id, quantity, updated_by_staff_id) VALUES ($1, $2, $3, $4)",
            [productId, warehouse_id, quantity, staffId]
        );

        // Update warehouse usage
        await db.query(
            "UPDATE warehouses SET current_usage = current_usage + $1 WHERE warehouse_id = $2",
            [quantity, warehouse_id]
        );

        // Commit transaction
        await db.query("COMMIT");

        res.status(200).json({
            status: "success",
            message: "Product added successfully"
        });
    } catch (err) {
        console.error(err.message);
        await db.query("ROLLBACK");
        res.status(500).json({
            status: "fail",
            message: "Server Error"
        });
    }
});

router.put("/:staffId/products/:productId/update", authorization, async (req, res) => {
    const { staffId, productId } = req.params;
    const { name, description, brand, size, category_id, price, product_type } = req.body;

    try {
        // Start transaction
        await db.query("BEGIN");

        // Update products table
        const productUpdate = await db.query(
            "UPDATE products SET name = $1, description = $2, category_id = $3, brand = $4, product_type = $5, size = $6 WHERE product_id = $7",
            [name, description, category_id, brand, product_type, size, productId]
        );

        if (productUpdate.rowCount === 0) {
            throw new Error("Product not found");
        }

        // Update product_prices table
        const priceUpdate = await db.query(
            "UPDATE product_prices SET price = $1, set_by_staff_id = $2 WHERE product_id = $3",
            [price, staffId, productId]
        );

        if (priceUpdate.rowCount === 0) {
            throw new Error("Product price not found");
        }

        // Commit transaction
        await db.query("COMMIT");

        res.status(200).json({
            status: "success",
            message: "Product updated successfully"
        });
    } catch (err) {
        console.error(err.message);
        await db.query("ROLLBACK");
        res.status(500).json({
            status: "fail",
            message: err.message || "Server Error"
        });
    }
});


// delete product and price
router.delete("/:staffId/products/:productId/delete", authorization, async (req, res) => {
    const { staffId, productId } = req.params;
    try {
        // Start transaction
        await db.query("BEGIN");

        // Get stock info first
        const stockResult = await db.query(
            "SELECT quantity, warehouse_id FROM stock WHERE product_id = $1",
            [productId]
        );

        if (stockResult.rowCount === 0) {
            throw new Error("Stock not found for the product");
        }

        const { quantity, warehouse_id } = stockResult.rows[0];

        // Update warehouse current usage
        const warehouseUpdate = await db.query(
            "UPDATE warehouses SET current_usage = current_usage - $1 WHERE warehouse_id = $2",
            [quantity, warehouse_id]
        );

        if (warehouseUpdate.rowCount === 0) {
            throw new Error("Warehouse not found for updating usage");
        }

        // Delete from stock table
        await db.query(
            "DELETE FROM stock WHERE product_id = $1",
            [productId]
        );

        // Delete from product_prices table
        await db.query(
            "DELETE FROM product_prices WHERE product_id = $1",
            [productId]
        );

        // Delete from products table
        const productDelete = await db.query(
            "DELETE FROM products WHERE product_id = $1",
            [productId]
        );

        if (productDelete.rowCount === 0) {
            throw new Error("Product not found for deletion");
        }

        // Commit transaction
        await db.query("COMMIT");

        res.status(200).json({
            status: "success",
            message: "Product deleted successfully and warehouse usage updated"
        });
    } catch (err) {
        await db.query("ROLLBACK");
        console.error(err.message);
        res.status(500).json({
            status: "fail",
            message: err.message || "Server Error"
        });
    }
});


module.exports = router;