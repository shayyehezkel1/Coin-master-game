import type { Category, Reminder } from '../types';
import { recurrenceLabels } from '../utils/recurrence';

interface Props {
  reminder: Reminder;
  category: Category | undefined;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

function formatDueAt(dueAt: string) {
  return new Date(dueAt).toLocaleString('he-IL', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export function ReminderItem({ reminder, category, onToggle, onDelete }: Props) {
  const isOverdue = !reminder.completed && new Date(reminder.dueAt).getTime() < Date.now();

  return (
    <li className={`reminder-item ${reminder.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}`}>
      <input
        type="checkbox"
        checked={reminder.completed}
        onChange={() => onToggle(reminder.id)}
        className="checkbox"
        aria-label="סמן כהושלם"
      />
      <div className="reminder-content">
        <div className="reminder-title-row">
          <span className="reminder-title">{reminder.title}</span>
          {category && (
            <span className="badge" style={{ backgroundColor: category.color }}>
              {category.name}
            </span>
          )}
          {reminder.recurrence !== 'none' && (
            <span className="badge badge-outline">{recurrenceLabels[reminder.recurrence]}</span>
          )}
        </div>
        {reminder.notes && <p className="reminder-notes">{reminder.notes}</p>}
        <span className="reminder-due">{formatDueAt(reminder.dueAt)}</span>
      </div>
      <button className="btn-icon" onClick={() => onDelete(reminder.id)} aria-label="מחק תזכורת">
        ✕
      </button>
    </li>
  );
}
