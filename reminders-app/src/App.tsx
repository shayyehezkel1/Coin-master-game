import { useState } from 'react';
import { useReminders } from './hooks/useReminders';
import { useCategories } from './hooks/useCategories';
import { useNotifications } from './hooks/useNotifications';
import { ReminderForm } from './components/ReminderForm';
import { ReminderList } from './components/ReminderList';
import { CategoryFilter } from './components/CategoryFilter';
import './App.css';

function App() {
  const { reminders, addReminder, deleteReminder, toggleComplete } = useReminders();
  const { categories, addCategory } = useCategories();
  const { permission, requestPermission } = useNotifications(reminders);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredReminders = selectedCategory
    ? reminders.filter((r) => r.category === selectedCategory)
    : reminders;

  return (
    <div className="app">
      <header className="app-header">
        <h1>📝 התזכורות שלי</h1>
        {permission !== 'granted' && (
          <button className="btn-secondary" onClick={requestPermission}>
            הפעלת התראות
          </button>
        )}
      </header>

      <ReminderForm categories={categories} onAdd={addReminder} onAddCategory={addCategory} />

      <CategoryFilter
        categories={categories}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />

      <ReminderList
        reminders={filteredReminders}
        categories={categories}
        onToggle={toggleComplete}
        onDelete={deleteReminder}
      />
    </div>
  );
}

export default App;
