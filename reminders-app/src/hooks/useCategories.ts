import { useLocalStorage } from './useLocalStorage';
import type { Category } from '../types';
import { defaultCategories } from '../defaultCategories';

export function useCategories() {
  const [customCategories, setCustomCategories] = useLocalStorage<Category[]>(
    'customCategories',
    [],
  );

  const categories = [...defaultCategories, ...customCategories];

  function addCategory(name: string, color: string) {
    const category: Category = { id: crypto.randomUUID(), name, color };
    setCustomCategories((prev) => [...prev, category]);
    return category;
  }

  return { categories, addCategory };
}
