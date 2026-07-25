const { getUser, nextId, save } = require('../db');

const PERIODS = {
  today: (d) => isSameDay(d, new Date()),
  week: (d) => isWithinDays(d, 7),
  month: (d) => isSameMonth(d, new Date()),
  all: () => true,
};

function isSameDay(a, b) {
  return a.toDateString() === b.toDateString();
}

function isSameMonth(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function isWithinDays(date, days) {
  const diffMs = Date.now() - date.getTime();
  return diffMs >= 0 && diffMs <= days * 24 * 60 * 60 * 1000;
}

function registerExpenseHandlers(bot) {
  bot.command('expense', (ctx) => {
    const parts = ctx.message.text.split(' ').slice(1);
    const amount = parseFloat(parts[0]);
    const category = parts[1];
    const desc = parts.slice(2).join(' ');

    if (!amount || Number.isNaN(amount) || !category) {
      return ctx.reply('שימוש: /expense <סכום> <קטגוריה> [תיאור]');
    }

    const user = getUser(ctx.chat.id);
    const id = nextId('expense');
    user.expenses.push({
      id,
      amount,
      category,
      desc: desc || '',
      date: new Date().toISOString(),
    });
    save();
    ctx.reply(`💸 נרשמה הוצאה #${id}: ${amount}₪ (${category})`);
  });

  bot.command('expenses', (ctx) => {
    const arg = (ctx.message.text.split(' ')[1] || 'month').toLowerCase();
    const filterFn = PERIODS[arg] || PERIODS.month;

    const user = getUser(ctx.chat.id);
    const filtered = user.expenses.filter((e) => filterFn(new Date(e.date)));

    if (filtered.length === 0) return ctx.reply('אין הוצאות בתקופה הזו.');

    const total = filtered.reduce((sum, e) => sum + e.amount, 0);
    const byCategory = {};
    for (const e of filtered) {
      byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
    }

    const categoryLines = Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, sum]) => `  ${cat}: ${sum}₪`);

    ctx.reply(
      `סיכום הוצאות (${arg}):\nסה"כ: ${total}₪\n\nלפי קטגוריה:\n${categoryLines.join('\n')}`
    );
  });

  bot.command('delexpense', (ctx) => {
    const arg = ctx.message.text.split(' ')[1];
    const id = parseInt(arg, 10);
    if (!id) return ctx.reply('שימוש: /delexpense <מספר הוצאה>');

    const user = getUser(ctx.chat.id);
    const idx = user.expenses.findIndex((e) => e.id === id);
    if (idx === -1) return ctx.reply(`לא נמצאה הוצאה #${id}`);

    user.expenses.splice(idx, 1);
    save();
    ctx.reply(`🗑️ הוצאה #${id} נמחקה.`);
  });
}

module.exports = { registerExpenseHandlers };
