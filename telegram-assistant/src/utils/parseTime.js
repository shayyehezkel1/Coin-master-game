const UNIT_MS = { m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };

// Parses either "in 30m" / "in 2h" / "in 1d" or "YYYY-MM-DD HH:MM"
// followed by the reminder text. Returns { dueAt: Date, text: string } or null.
function parseReminderArgs(rawArgs) {
  const text = rawArgs.trim();
  if (!text) return null;

  const relativeMatch = text.match(/^in\s+(\d+)(m|h|d)\s+(.+)$/i);
  if (relativeMatch) {
    const [, amountStr, unit, remainder] = relativeMatch;
    const amount = parseInt(amountStr, 10);
    const dueAt = new Date(Date.now() + amount * UNIT_MS[unit.toLowerCase()]);
    return { dueAt, text: remainder.trim() };
  }

  const absoluteMatch = text.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})\s+(.+)$/);
  if (absoluteMatch) {
    const [, datePart, timePart, remainder] = absoluteMatch;
    const dueAt = new Date(`${datePart}T${timePart}:00`);
    if (Number.isNaN(dueAt.getTime())) return null;
    return { dueAt, text: remainder.trim() };
  }

  return null;
}

module.exports = { parseReminderArgs };
