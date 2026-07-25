// Installs the bot as a native Windows Service (auto-start on boot, auto-restart on crash).
// Run this on the Windows machine itself, as Administrator, after `npm install node-windows`.
const path = require('path');
const { Service } = require('node-windows');

const svc = new Service({
  name: 'TelegramPersonalAssistant',
  description: 'Personal assistant Telegram bot (tasks, reminders, notes, expenses, AI chat).',
  script: path.join(__dirname, '..', 'src', 'bot.js'),
  workingDirectory: path.join(__dirname, '..'),
});

svc.on('alreadyinstalled', () => {
  console.log('השירות כבר מותקן.');
});

svc.on('install', () => {
  console.log('השירות הותקן, מפעיל...');
  svc.start();
});

svc.on('start', () => {
  console.log('השירות רץ. אפשר לבדוק ב-services.msc תחת השם "TelegramPersonalAssistant".');
});

svc.on('error', (err) => {
  console.error('שגיאה:', err);
});

svc.install();
