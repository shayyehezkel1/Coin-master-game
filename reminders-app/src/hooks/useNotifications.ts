import { useEffect, useRef, useState } from 'react';
import type { Reminder } from '../types';

const POLL_INTERVAL_MS = 20_000;

export function useNotifications(reminders: Reminder[]) {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied',
  );
  const notifiedKeys = useRef<Set<string>>(new Set());

  async function requestPermission() {
    if (typeof Notification === 'undefined') return;
    const result = await Notification.requestPermission();
    setPermission(result);
  }

  useEffect(() => {
    if (permission !== 'granted') return;

    function checkDueReminders() {
      const now = Date.now();
      for (const reminder of reminders) {
        if (reminder.completed) continue;
        const key = `${reminder.id}:${reminder.dueAt}`;
        if (notifiedKeys.current.has(key)) continue;
        if (new Date(reminder.dueAt).getTime() <= now) {
          new Notification(reminder.title, {
            body: reminder.notes || 'הגיע הזמן לתזכורת',
            tag: key,
          });
          notifiedKeys.current.add(key);
        }
      }
    }

    checkDueReminders();
    const intervalId = setInterval(checkDueReminders, POLL_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [reminders, permission]);

  return { permission, requestPermission };
}
