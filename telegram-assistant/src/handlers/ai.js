const Anthropic = require('@anthropic-ai/sdk');
const { getUser, save } = require('../db');

const MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-5';
const MAX_HISTORY_MESSAGES = 10;
const SYSTEM_PROMPT =
  'אתה עוזר אישי ידידותי בטלגרם. ענה בקצרה, בעברית, ובגובה העיניים, אלא אם המשתמש כתב באנגלית.';

function registerAiHandlers(bot) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const client = apiKey ? new Anthropic({ apiKey }) : null;

  bot.command('reset', (ctx) => {
    const user = getUser(ctx.chat.id);
    user.aiHistory = [];
    save();
    ctx.reply('🔄 הקשר השיחה אופס.');
  });

  bot.on('text', async (ctx) => {
    const text = ctx.message.text;
    if (text.startsWith('/')) return; // let command handlers deal with it

    if (!client) {
      return ctx.reply(
        'תכונת הצ׳אט החכם לא מוגדרת. יש להגדיר ANTHROPIC_API_KEY בקובץ .env כדי להפעיל אותה.'
      );
    }

    const user = getUser(ctx.chat.id);
    user.aiHistory.push({ role: 'user', content: text });
    user.aiHistory = user.aiHistory.slice(-MAX_HISTORY_MESSAGES);

    await ctx.sendChatAction('typing');

    try {
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: user.aiHistory,
      });

      const reply = response.content
        .filter((block) => block.type === 'text')
        .map((block) => block.text)
        .join('\n')
        .trim();

      user.aiHistory.push({ role: 'assistant', content: reply });
      user.aiHistory = user.aiHistory.slice(-MAX_HISTORY_MESSAGES);
      save();

      ctx.reply(reply || 'לא התקבלה תשובה.');
    } catch (err) {
      console.error('AI error:', err.message);
      ctx.reply('אירעה שגיאה בפנייה לעוזר החכם, נסה שוב מאוחר יותר.');
    }
  });
}

module.exports = { registerAiHandlers };
