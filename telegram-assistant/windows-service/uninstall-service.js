// Removes the Windows Service installed by install-service.js.
// Run this on the Windows machine, as Administrator.
const path = require('path');
const { Service } = require('node-windows');

const svc = new Service({
  name: 'TelegramPersonalAssistant',
  script: path.join(__dirname, '..', 'src', 'bot.js'),
});

svc.on('uninstall', () => {
  console.log('השירות הוסר.');
});

svc.uninstall();
