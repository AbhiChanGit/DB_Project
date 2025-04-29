const {Pool} = require('pg');
const schedule = require('node-schedule')
require('dotenv').config();


const pool = new Pool();
module.exports = {
    query: (text, params) => pool.query(text, params),
};

schedule.scheduleJob('* * * * *', async () => {
    try {
        const deleteQuery = "DELETE FROM verifying WHERE NOW() - created_at > interval '10 minutes';";
        await pool.query(deleteQuery);
        console.log("Deleted code");
    } catch (err) {
        console.error(err.message);
    }
})

process.stdin.resume();