require('dotenv').config();
const schedule = require('node-schedule');
const prisma = require('./prismaClient');

/* // Every minute: delete any verifying records older than 10 minutes
schedule.scheduleJob('* * * * *', async () => {
  try {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const { count } = await prisma.verifying.deleteMany({
      where: {
        created_at: { lte: tenMinutesAgo }
      }
    });
    if (count) {
      console.log(`🗑️  Deleted ${count} old verification code(s)`);
    }
  } catch (err) {
    console.error('Error purging verifying table:', err);
  }
}); */

// Every minute: delete any verifying records older than 10 minutes
schedule.scheduleJob('* * * * *', async () => {
  try {
    const result = await prisma.$executeRawUnsafe(`
      DELETE FROM verifying
      WHERE created_at + interval '10 minutes' < NOW()
    `);
    console.log(`🗑️  Deleted ${result} old verification code(s)`);
  } catch (err) {
    console.error('Error purging verifying table:', err);
  }
});

// keep the process alive if you run this file directly
if (require.main === module) {
  console.log('Verifier cleanup scheduler started');
  process.stdin.resume();
}

module.exports = {};
