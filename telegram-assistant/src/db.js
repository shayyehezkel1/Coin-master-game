const fs = require('fs');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'db.json');

function emptyDb() {
  return {
    users: {},
    nextId: { task: 1, note: 1, expense: 1, reminder: 1 },
  };
}

function load() {
  if (!fs.existsSync(DB_PATH)) {
    return emptyDb();
  }
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } catch {
    return emptyDb();
  }
}

let db = load();

function save() {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function getUser(chatId) {
  const key = String(chatId);
  if (!db.users[key]) {
    db.users[key] = { tasks: [], notes: [], expenses: [], reminders: [], aiHistory: [] };
  }
  return db.users[key];
}

function nextId(kind) {
  const id = db.nextId[kind];
  db.nextId[kind] += 1;
  return id;
}

function getAllUserIds() {
  return Object.keys(db.users);
}

module.exports = { getUser, nextId, save, getAllUserIds };
