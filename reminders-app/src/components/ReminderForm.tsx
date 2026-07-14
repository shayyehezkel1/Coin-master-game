import { useState } from 'react';
import type { Category, Recurrence, Reminder } from '../types';
import { recurrenceLabels } from '../utils/recurrence';

interface Props {
  categories: Category[];
  onAdd: (input: Omit<Reminder, 'id' | 'completed' | 'createdAt'>) => void;
  onAddCategory: (name: string, color: string) => Category;
}

function defaultDueAt() {
  const date = new Date();
  date.setMinutes(date.getMinutes() + 30);
  date.setSeconds(0, 0);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export function ReminderForm({ categories, onAdd, onAddCategory }: Props) {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [dueAt, setDueAt] = useState(defaultDueAt());
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '');
  const [recurrence, setRecurrence] = useState<Recurrence>('none');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !dueAt) return;
    onAdd({
      title: title.trim(),
      notes: notes.trim(),
      dueAt: new Date(dueAt).toISOString(),
      category: categoryId,
      recurrence,
    });
    setTitle('');
    setNotes('');
    setDueAt(defaultDueAt());
    setRecurrence('none');
  }

  function handleAddCategory() {
    if (!newCategoryName.trim()) return;
    const colors = ['#6366f1', '#0ea5e9', '#f59e0b', '#10b981', '#ec4899', '#8b5cf6'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const category = onAddCategory(newCategoryName.trim(), color);
    setCategoryId(category.id);
    setNewCategoryName('');
    setShowNewCategory(false);
  }

  return (
    <form className="reminder-form" onSubmit={handleSubmit}>
      <input
        className="input title-input"
        type="text"
        placeholder="מה צריך לזכור?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        className="input"
        placeholder="הערות (אופציונלי)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
      />
      <div className="form-row">
        <label className="field">
          <span>מועד</span>
          <input
            className="input"
            type="datetime-local"
            value={dueAt}
            onChange={(e) => setDueAt(e.target.value)}
            required
          />
        </label>
        <label className="field">
          <span>חזרתיות</span>
          <select
            className="input"
            value={recurrence}
            onChange={(e) => setRecurrence(e.target.value as Recurrence)}
          >
            {Object.entries(recurrenceLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="form-row">
        <label className="field grow">
          <span>קטגוריה</span>
          <select
            className="input"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setShowNewCategory((v) => !v)}
        >
          + קטגוריה
        </button>
      </div>
      {showNewCategory && (
        <div className="form-row">
          <input
            className="input grow"
            type="text"
            placeholder="שם קטגוריה חדשה"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
          <button type="button" className="btn-secondary" onClick={handleAddCategory}>
            הוסף
          </button>
        </div>
      )}
      <button type="submit" className="btn-primary">
        הוספת תזכורת
      </button>
    </form>
  );
}
