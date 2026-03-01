import React, { useState, useEffect } from 'react';
import { useReminders } from '../../contexts/ReminderContext';

const RemindersView = () => {
  const { 
    reminders, 
    loading,
    user,
    addReminder, 
    deleteReminder, 
    extendReminder,
    getTodayReminders,
    getUpcomingReminders,
    getOverdueReminders,
    loadRemindersFromSupabase
  } = useReminders();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReminder, setNewReminder] = useState({
    title: '',
    reminderDate: new Date().toISOString().split('T')[0],
    reminderTime: '09:00'
  });
  const [activeTab, setActiveTab] = useState('upcoming'); // upcoming, today, overdue

  // Загружаем напоминания при монтировании
  useEffect(() => {
    loadRemindersFromSupabase(null);
  }, []);

  const handleAddReminder = async (e) => {
    e.preventDefault();
    if (!newReminder.title.trim()) return;
    
    // Проверка даты
    const today = new Date().toISOString().split('T')[0];
    if (newReminder.reminderDate < today) {
      alert('Нельзя создавать напоминания в прошедшем времени!');
      return;
    }
    
    const result = await addReminder({
      title: newReminder.title,
      reminderDate: newReminder.reminderDate,
      reminderTime: newReminder.reminderTime,
      telegramChatId: '849886384'
    });
    
    if (result) {
      setNewReminder({
        title: '',
        reminderDate: new Date().toISOString().split('T')[0],
        reminderTime: '09:00'
      });
      setShowAddForm(false);
      loadRemindersFromSupabase(null);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Удалить это напоминание?')) {
      await deleteReminder(id);
    }
  };

  const getDisplayReminders = () => {
    switch (activeTab) {
      case 'today':
        return getTodayReminders();
      case 'overdue':
        return getOverdueReminders();
      default:
        return getUpcomingReminders();
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'short',
      weekday: 'short'
    });
  };

  const getStatusColor = (reminder) => {
    const today = new Date().toISOString().split('T')[0];
    if (reminder.reminderDate < today) return 'bg-red-100 dark:bg-red-900/30 border-red-300';
    if (reminder.reminderDate === today) return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300';
    return 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const displayReminders = getDisplayReminders();

  return (
    <div className="p-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          🔔 Напоминания
        </h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          {showAddForm ? '✕ Отмена' : '+ Добавить'}
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <form onSubmit={handleAddReminder}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Название
              </label>
              <input
                type="text"
                value={newReminder.title}
                onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                placeholder="Что нужно сделать?"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Дата
                </label>
                <input
                  type="date"
                  value={newReminder.reminderDate}
                  onChange={(e) => setNewReminder({ ...newReminder, reminderDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Время
                </label>
                <input
                  type="time"
                  value={newReminder.reminderTime}
                  onChange={(e) => setNewReminder({ ...newReminder, reminderTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-medium"
            >
              Создать напоминание
            </button>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 rounded-lg whitespace-nowrap ${
            activeTab === 'upcoming'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          📅 Предстоящие ({getUpcomingReminders().length})
        </button>

        <button
          onClick={() => setActiveTab('overdue')}
          className={`px-4 py-2 rounded-lg whitespace-nowrap ${
            activeTab === 'overdue'
              ? 'bg-red-500 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          🔴 Просроченные ({getOverdueReminders().length})
        </button>
      </div>

      {/* Reminders List */}
      <div className="space-y-3">
        {displayReminders.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p className="text-4xl mb-2">🔔</p>
            <p>Нет напоминаний</p>
            <p className="text-sm">Нажмите "Добавить" чтобы создать</p>
          </div>
        ) : (
          displayReminders.map((reminder) => (
            <div
              key={reminder.id}
              className={`p-4 rounded-lg border-2 ${getStatusColor(reminder)}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {reminder.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-600 dark:text-gray-400">
                    <span>📅 {formatDate(reminder.reminderDate)}</span>
                    <span>⏰ {reminder.reminderTime ? reminder.reminderTime.split(':').slice(0,2).join(':') : ''}</span>
                  </div>
                  {reminder.extendedCount > 0 && (
                    <span className="inline-block mt-2 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">
                      🔄 Продлено: {reminder.extendedCount} раз
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(reminder.id)}
                  className="text-red-500 hover:text-red-700 p-2"
                  title="Удалить"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          ℹ️ Если что-то случилось, то пиши мне :3
        </p>
      </div>
    </div>
  );
};

export default RemindersView;
