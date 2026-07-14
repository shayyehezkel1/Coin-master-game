import type { Category, Reminder } from '../types';

interface Props {
  categories: Category[];
  reminders: Reminder[];
  selected: string | null;
  onSelect: (categoryId: string | null) => void;
}

export function CategoryFilter({ categories, reminders, selected, onSelect }: Props) {
  const activeCount = (categoryId: string | null) =>
    reminders.filter((r) => !r.completed && (categoryId === null || r.category === categoryId)).length;

  return (
    <div className="lists-strip">
      <button
        className={`list-chip ${selected === null ? 'active' : ''}`}
        onClick={() => onSelect(null)}
      >
        <span className="list-chip-icon list-chip-icon-all">הכול</span>
        <span className="list-chip-count">{activeCount(null)}</span>
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          className={`list-chip ${selected === category.id ? 'active' : ''}`}
          onClick={() => onSelect(category.id)}
        >
          <span className="list-chip-icon" style={{ backgroundColor: category.color }} />
          <span className="list-chip-name">{category.name}</span>
          <span className="list-chip-count">{activeCount(category.id)}</span>
        </button>
      ))}
    </div>
  );
}
