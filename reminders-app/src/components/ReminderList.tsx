import type { Category, Reminder } from '../types';
import { ReminderItem } from './ReminderItem';
import { ReminderForm } from './ReminderForm';

interface Props {
  reminders: Reminder[];
  categories: Category[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: (input: Omit<Reminder, 'id' | 'completed' | 'createdAt'>) => void;
  onAddCategory: (name: string, color: string) => Category;
}

export function ReminderList({
  reminders,
  categories,
  onToggle,
  onDelete,
  onAdd,
  onAddCategory,
}: Props) {
  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const active = reminders
    .filter((r) => !r.completed)
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
  const completed = reminders
    .filter((r) => r.completed)
    .sort((a, b) => new Date(b.dueAt).getTime() - new Date(a.dueAt).getTime());

  return (
    <div className="reminder-list">
      <div className="grouped-card">
        {active.length === 0 && completed.length === 0 && (
          <p className="empty-state">אין תזכורות עדיין. הוסיפו את הראשונה למטה!</p>
        )}
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
        <ReminderForm categories={categories} onAdd={onAdd} onAddCategory={onAddCategory} />
      </div>

      {completed.length > 0 && (
        <details className="completed-section">
          <summary>הושלמו ({completed.length})</summary>
          <div className="grouped-card">
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
          </div>
        </details>
      )}
    </div>
  );
}
