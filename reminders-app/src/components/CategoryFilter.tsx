import type { Category } from '../types';

interface Props {
  categories: Category[];
  selected: string | null;
  onSelect: (categoryId: string | null) => void;
}

export function CategoryFilter({ categories, selected, onSelect }: Props) {
  return (
    <div className="category-filter">
      <button
        className={`pill ${selected === null ? 'active' : ''}`}
        style={{ '--pill-color': '#64748b' } as React.CSSProperties}
        onClick={() => onSelect(null)}
      >
        הכול
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          className={`pill ${selected === category.id ? 'active' : ''}`}
          style={{ '--pill-color': category.color } as React.CSSProperties}
          onClick={() => onSelect(category.id)}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
