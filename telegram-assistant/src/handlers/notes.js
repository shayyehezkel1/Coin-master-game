const { getUser, nextId, save } = require('../db');

function registerNoteHandlers(bot) {
  bot.command('note', (ctx) => {
    const text = ctx.message.text.split(' ').slice(1).join(' ').trim();
    if (!text) return ctx.reply('שימוש: /note <טקסט הפתק>');

    const user = getUser(ctx.chat.id);
    const id = nextId('note');
    user.notes.push({ id, text, createdAt: new Date().toISOString() });
    save();
    ctx.reply(`📝 נשמר פתק #${id}`);
  });

  bot.command('notes', (ctx) => {
    const user = getUser(ctx.chat.id);
    if (user.notes.length === 0) return ctx.reply('אין פתקים שמורים.');
    const lines = user.notes.map((n) => `#${n.id} – ${n.text}`);
    ctx.reply(`הפתקים שלך:\n${lines.join('\n')}`);
  });

  bot.command('delnote', (ctx) => {
    const arg = ctx.message.text.split(' ')[1];
    const id = parseInt(arg, 10);
    if (!id) return ctx.reply('שימוש: /delnote <מספר פתק>');

    const user = getUser(ctx.chat.id);
    const idx = user.notes.findIndex((n) => n.id === id);
    if (idx === -1) return ctx.reply(`לא נמצא פתק #${id}`);

    user.notes.splice(idx, 1);
    save();
    ctx.reply(`🗑️ פתק #${id} נמחק.`);
  });
}

module.exports = { registerNoteHandlers };
