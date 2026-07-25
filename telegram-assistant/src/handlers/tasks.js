const { getUser, nextId, save } = require('../db');
const { parseReminderArgs } = require('../utils/parseTime');

function registerTaskHandlers(bot) {
  bot.command('task', (ctx) => {
    const text = ctx.message.text.split(' ').slice(1).join(' ').trim();
    if (!text) return ctx.reply('שימוש: /task <טקסט המשימה>');

    const user = getUser(ctx.chat.id);
    const id = nextId('task');
    user.tasks.push({ id, text, createdAt: new Date().toISOString() });
    save();
    ctx.reply(`✅ נוספה משימה #${id}: ${text}`);
  });

  bot.command('tasks', (ctx) => {
    const user = getUser(ctx.chat.id);
    if (user.tasks.length === 0) return ctx.reply('אין משימות פתוחות 🎉');
    const lines = user.tasks.map((t) => `#${t.id} – ${t.text}`);
    ctx.reply(`המשימות שלך:\n${lines.join('\n')}`);
  });

  bot.command('done', (ctx) => {
    const arg = ctx.message.text.split(' ')[1];
    const id = parseInt(arg, 10);
    if (!id) return ctx.reply('שימוש: /done <מספר משימה>');

    const user = getUser(ctx.chat.id);
    const idx = user.tasks.findIndex((t) => t.id === id);
    if (idx === -1) return ctx.reply(`לא נמצאה משימה #${id}`);

    const [removed] = user.tasks.splice(idx, 1);
    save();
    ctx.reply(`🎉 בוצע: ${removed.text}`);
  });

  bot.command('remind', (ctx) => {
    const rawArgs = ctx.message.text.split(' ').slice(1).join(' ');
    const parsed = parseReminderArgs(rawArgs);
    if (!parsed) {
      return ctx.reply(
        'שימוש:\n/remind in 30m <טקסט>\nאו\n/remind 2026-07-25 18:30 <טקסט>'
      );
    }
    if (parsed.dueAt.getTime() <= Date.now()) {
      return ctx.reply('הזמן שציינת כבר עבר, נסה זמן עתידי.');
    }
    if (!parsed.text) {
      return ctx.reply('חסר טקסט לתזכורת.');
    }

    const user = getUser(ctx.chat.id);
    const id = nextId('reminder');
    user.reminders.push({
      id,
      text: parsed.text,
      dueAt: parsed.dueAt.toISOString(),
      sent: false,
    });
    save();
    ctx.reply(`⏰ תזכורת #${id} נקבעה ל-${parsed.dueAt.toLocaleString('he-IL')}`);
  });

  bot.command('reminders', (ctx) => {
    const user = getUser(ctx.chat.id);
    const pending = user.reminders.filter((r) => !r.sent);
    if (pending.length === 0) return ctx.reply('אין תזכורות ממתינות.');
    const lines = pending.map(
      (r) => `#${r.id} – ${r.text} (${new Date(r.dueAt).toLocaleString('he-IL')})`
    );
    ctx.reply(`תזכורות ממתינות:\n${lines.join('\n')}`);
  });

  bot.command('cancel', (ctx) => {
    const arg = ctx.message.text.split(' ')[1];
    const id = parseInt(arg, 10);
    if (!id) return ctx.reply('שימוש: /cancel <מספר תזכורת>');

    const user = getUser(ctx.chat.id);
    const idx = user.reminders.findIndex((r) => r.id === id);
    if (idx === -1) return ctx.reply(`לא נמצאה תזכורת #${id}`);

    user.reminders.splice(idx, 1);
    save();
    ctx.reply(`🗑️ תזכורת #${id} בוטלה.`);
  });
}

module.exports = { registerTaskHandlers };
