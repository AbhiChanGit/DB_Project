const jwt = require('jsonwebtoken');

const token = jwt.sign({ user: { id: 10 } }, "cat123", { expiresIn: '1h' });
console.log("Generated JWT:\n", token);
