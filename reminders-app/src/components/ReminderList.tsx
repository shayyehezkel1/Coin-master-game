import type { Category, Reminder } from '../types';
import { ReminderItem } from './ReminderItem';

interface Props {
  reminders: Reminder[];
  categories: Category[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ReminderList({ reminders, categories, onToggle, onDelete }: Props) {
  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const active = reminders
    .filter((r) => !r.completed)
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
  const completed = reminders
    .filter((r) => r.completed)
    .sort((a, b) => new Date(b.dueAt).getTime() - new Date(a.dueAt).getTime());

  if (reminders.length === 0) {
    return <p className="empty-state">אין תזכורות עדיין. הוסיפו את הראשונה למעלה!</p>;
  }

  return (
    <div className="reminder-list">
      {active.length > 0 && (
        <ul className="list">
          {active.map((reminder) => (
            <ReminderItem
              key={reminder.id}
              reminder={reminder}
              category={categoryMap.get(reminder.category)}
              onToggle={onToggle}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
      {completed.length > 0 && (
        <details className="completed-section">
          <summary>הושלמו ({completed.length})</summary>
          <ul className="list">
            {completed.map((reminder) => (
              <ReminderItem
                key={reminder.id}
                reminder={reminder}
                category={categoryMap.get(reminder.category)}
                onToggle={onToggle}
                onDelete={onDelete}
              />
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
