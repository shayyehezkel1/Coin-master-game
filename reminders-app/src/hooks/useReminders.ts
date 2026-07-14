import { useLocalStorage } from './useLocalStorage';
import type { Reminder } from '../types';
import { nextOccurrence } from '../utils/recurrence';

export function useReminders() {
  const [reminders, setReminders] = useLocalStorage<Reminder[]>('reminders', []);

  function addReminder(input: Omit<Reminder, 'id' | 'completed' | 'createdAt'>) {
    const reminder: Reminder = {
      ...input,
      id: crypto.randomUUID(),
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setReminders((prev) => [...prev, reminder]);
  }

  function updateReminder(id: string, changes: Partial<Reminder>) {
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, ...changes } : r)));
  }

  function deleteReminder(id: string) {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  }

  function toggleComplete(id: string) {
    setReminders((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        if (!r.completed && r.recurrence !== 'none') {
          return { ...r, dueAt: nextOccurrence(r.dueAt, r.recurrence), completed: false };
        }
        return { ...r, completed: !r.completed };
      }),
    );
  }

  return { reminders, addReminder, updateReminder, deleteReminder, toggleComplete };
}
