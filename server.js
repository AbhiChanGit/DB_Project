require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const db = require("./db");

app.use(cors());
app.use(express.json());
app.use("/auth", require("./routes/jwtAuth"));

app.use("/customers", require("./routes/customers"));
app.use("/staffs", require("./routes/staffs"));

const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});