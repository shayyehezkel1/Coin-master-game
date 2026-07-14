import { useState } from 'react';
import { useReminders } from './hooks/useReminders';
import { useCategories } from './hooks/useCategories';
import { useNotifications } from './hooks/useNotifications';
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
        <h1>תזכורות</h1>
        {permission !== 'granted' && (
          <button className="bell-btn" onClick={requestPermission} aria-label="הפעלת התראות">
            🔔
          </button>
        )}
      </header>

      <CategoryFilter
        categories={categories}
        reminders={reminders}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />

      <ReminderList
        reminders={filteredReminders}
        categories={categories}
        onToggle={toggleComplete}
        onDelete={deleteReminder}
        onAdd={addReminder}
        onAddCategory={addCategory}
      />
    </div>
  );
}

export default App;
