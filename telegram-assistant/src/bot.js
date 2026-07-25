require('dotenv').config();
const { Telegraf } = require('telegraf');

const { registerTaskHandlers } = require('./handlers/tasks');
const { registerNoteHandlers } = require('./handlers/notes');
const { registerExpenseHandlers } = require('./handlers/expenses');
const { registerAiHandlers } = require('./handlers/ai');
const { startReminderScheduler } = require('./scheduler');

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error('Missing TELEGRAM_BOT_TOKEN. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

const bot = new Telegraf(token);

const HELP_TEXT = `👋 היי! אני העוזר האישי שלך. הנה מה שאני יודע לעשות:

📋 משימות
/task <טקסט> – הוספת משימה
/tasks – רשימת משימות
/done <מספר> – סימון משימה כבוצעה

⏰ תזכורות
/remind in 30m <טקסט> – תזכורת יחסית
/remind 2026-07-25 18:30 <טקסט> – תזכורת לזמן מסוים
/reminders – רשימת תזכורות ממתינות
/cancel <מספר> – ביטול תזכורת

📝 פתקים
/note <טקסט> – שמירת פתק
/notes – רשימת פתקים
/delnote <מספר> – מחיקת פתק

💸 הוצאות
/expense <סכום> <קטגוריה> [תיאור] – רישום הוצאה
/expenses [today|week|month|all] – סיכום הוצאות
/delexpense <מספר> – מחיקת הוצאה

💬 צ'אט חכם
כל הודעה שאינה פקודה תיענה על ידי העוזר החכם.
/reset – איפוס הקשר השיחה

/help – ההודעה הזו`;

bot.start((ctx) => ctx.reply(HELP_TEXT));
bot.help((ctx) => ctx.reply(HELP_TEXT));

registerTaskHandlers(bot);
registerNoteHandlers(bot);
registerExpenseHandlers(bot);
registerAiHandlers(bot); // must be registered last: it also handles free-text messages

startReminderScheduler(bot);

bot.launch();
console.log('🤖 Telegram assistant bot is running...');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
