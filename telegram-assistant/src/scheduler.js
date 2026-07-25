const cron = require('node-cron');
const { getAllUserIds, getUser, save } = require('./db');

function startReminderScheduler(bot) {
  cron.schedule('* * * * *', async () => {
    const now = Date.now();

    for (const chatId of getAllUserIds()) {
      const user = getUser(chatId);
      const due = user.reminders.filter((r) => !r.sent && new Date(r.dueAt).getTime() <= now);

      for (const reminder of due) {
        try {
          await bot.telegram.sendMessage(chatId, `⏰ תזכורת: ${reminder.text}`);
        } catch (err) {
          console.error(`Failed to send reminder to ${chatId}:`, err.message);
        }
        reminder.sent = true;
      }

      if (due.length > 0) {
        user.reminders = user.reminders.filter((r) => !r.sent);
      }
    }

    save();
  });
}

module.exports = { startReminderScheduler };
