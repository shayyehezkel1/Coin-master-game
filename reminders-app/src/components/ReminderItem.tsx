import { useRef, useState } from 'react';
import type { Category, Reminder } from '../types';
import { recurrenceLabels } from '../utils/recurrence';

interface Props {
  reminder: Reminder;
  category: Category | undefined;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const OPEN_OFFSET = -76;
const DRAG_THRESHOLD = -38;

function formatDueAt(dueAt: string) {
  return new Date(dueAt).toLocaleString('he-IL', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export function ReminderItem({ reminder, category, onToggle, onDelete }: Props) {
  const isOverdue = !reminder.completed && new Date(reminder.dueAt).getTime() < Date.now();
  const [offset, setOffset] = useState(0);
  const dragState = useRef<{ startX: number; base: number; dragging: boolean; moved: boolean } | null>(
    null,
  );

  function handlePointerDown(e: React.PointerEvent) {
    (e.target as Element).setPointerCapture(e.pointerId);
    dragState.current = { startX: e.clientX, base: offset, dragging: true, moved: false };
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragState.current?.dragging) return;
    const delta = e.clientX - dragState.current.startX;
    if (Math.abs(delta) > 4) dragState.current.moved = true;
    const next = Math.min(0, Math.max(OPEN_OFFSET, dragState.current.base + delta));
    setOffset(next);
  }

  function handlePointerUp() {
    if (!dragState.current) return;
    dragState.current.dragging = false;
    setOffset((current) => (current < DRAG_THRESHOLD ? OPEN_OFFSET : 0));
  }

  function handleContentClick() {
    if (dragState.current?.moved) return;
    if (offset !== 0) setOffset(0);
  }

  const color = category?.color ?? 'var(--accent)';

  return (
    <li className="reminder-item-wrapper">
      <button
        className="swipe-delete-btn"
        style={{ opacity: offset < 0 ? 1 : 0 }}
        onClick={() => onDelete(reminder.id)}
        aria-label="מחק תזכורת"
      >
        מחק
      </button>
      <div
        className={`reminder-item ${reminder.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}`}
        style={{ transform: `translateX(${offset}px)` }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={handleContentClick}
      >
        <button
          className="circle-checkbox"
          style={{
            borderColor: color,
            backgroundColor: reminder.completed ? color : 'transparent',
          }}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(reminder.id);
          }}
          aria-label="סמן כהושלם"
        >
          {reminder.completed && <span className="checkmark">✓</span>}
        </button>
        <div className="reminder-content">
          <span className="reminder-title">{reminder.title}</span>
          {reminder.notes && <p className="reminder-notes">{reminder.notes}</p>}
          <div className="reminder-meta">
            <span className={`reminder-due ${isOverdue ? 'overdue-text' : ''}`}>
              {formatDueAt(reminder.dueAt)}
            </span>
            {reminder.recurrence !== 'none' && (
              <span className="reminder-recurrence">חוזר · {recurrenceLabels[reminder.recurrence]}</span>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}
