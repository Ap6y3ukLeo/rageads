import React, { useState, useEffect } from 'react';
import { useReminders } from '../../contexts/ReminderContext';
// v2.0 - Added edit and extend functionality

const RemindersView = () => {
  const { 
    reminders, 
    loading,
    user,
    addReminder, 
    deleteReminder, 
    updateReminder,
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
  
  // States for editing
  const [editingReminder, setEditingReminder] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', reminderDate: '', reminderTime: '' });
  
  // States for extending
  const [extendingReminder, setExtendingReminder] = useState(null);

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

  const startEdit = (reminder) => {
    setEditingReminder(reminder);
    setEditForm({
      title: reminder.title,
      reminderDate: reminder.reminderDate,
      reminderTime: reminder.reminderTime
    });
    setExtendingReminder(null);
  };

  const cancelEdit = () => {
    setEditingReminder(null);
    setEditForm({ title: '', reminderDate: '', reminderTime: '' });
  };

  const saveEdit = async () => {
    if (!editForm.title.trim()) {
      alert('Название не может быть пустым');
      return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    if (editForm.reminderDate < today) {
      alert('Нельзя установить дату в прошлом!');
      return;
    }

    await updateReminder(editingReminder.id, {
      title: editForm.title,
      reminderDate: editForm.reminderDate,
      reminderTime: editForm.reminderTime
    });
    
    setEditingReminder(null);
    loadRemindersFromSupabase(null);
  };

  const startExtend = (reminder) => {
    setExtendingReminder(reminder);
    setEditingReminder(null);
  };

  const cancelExtend = () => {
    setExtendingReminder(null);
  };

  const doExtend = async (type) => {
    if (!extendingReminder) return;

    const now = new Date();
    const currentDateTime = new Date(`${extendingReminder.reminderDate}T${extendingReminder.reminderTime}`);
    
    let newDate, newTime;
    
    switch (type) {
      case '1h':
        // +1 час от дедлайна или текущего времени
        const base1h = currentDateTime > now ? currentDateTime : now;
        const extended1h = new Date(base1h.getTime() + 60 * 60 * 1000);
        newDate = extended1h.toISOString().split('T')[0];
        newTime = extended1h.toTimeString().slice(0, 5);
        break;
      case 'tomorrow':
        // Завтра в то же время
        const tomorrow = new Date(currentDateTime);
        tomorrow.setDate(tomorrow.getDate() + 1);
        if (tomorrow < now) tomorrow.setDate(tomorrow.getDate() + 1);
        newDate = tomorrow.toISOString().split('T')[0];
        newTime = extendingReminder.reminderTime;
        break;
      case 'dayafter':
        // Послезавтра в то же время
        const dayAfter = new Date(currentDateTime);
        dayAfter.setDate(dayAfter.getDate() + 2);
        if (dayAfter < now) dayAfter.setDate(dayAfter.getDate() + 1);
        newDate = dayAfter.toISOString().split('T')[0];
        newTime = extendingReminder.reminderTime;
        break;
      default:
        return;
    }

    await extendReminder(extendingReminder.id, newDate, newTime);
    setExtendingReminder(null);
    loadRemindersFromSupabase(null);
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
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().slice(0, 5);
    
    // Просрочено по дате или по времени сегодня
    if (reminder.reminderDate < today) return 'bg-red-100 dark:bg-red-900/30 border-red-300';
    if (reminder.reminderDate === today && reminder.reminderTime && reminder.reminderTime < currentTime) {
      return 'bg-red-100 dark:bg-red-900/30 border-red-300';
    }
    if (reminder.reminderDate === today) return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300';
    return 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700';
  };

  const isOverdue = (reminder) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().slice(0, 5);
    
    if (reminder.reminderDate < today) return true;
    if (reminder.reminderDate === today && reminder.reminderTime && reminder.reminderTime < currentTime) {
      return true;
    }
    return false;
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
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          🔔 <span className="hidden sm:inline">Напоминания</span>
        </h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm min-h-[44px] transition-colors"
        >
          {showAddForm ? <><span>✕</span><span className="hidden sm:inline">Отмена</span></> : <><span>+</span><span className="hidden sm:inline">Добавить</span></>}
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
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-3 sm:px-4 py-2.5 rounded-lg whitespace-nowrap text-sm min-h-[44px] flex items-center gap-2 ${
            activeTab === 'upcoming'
              ? 'bg-gray-800 dark:bg-gray-700 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
          <span>Впереди</span>
          <span className="bg-white/20 px-1.5 rounded text-xs">{getUpcomingReminders().length}</span>
        </button>

        <button
          onClick={() => setActiveTab('today')}
          className={`px-3 sm:px-4 py-2.5 rounded-lg whitespace-nowrap text-sm min-h-[44px] flex items-center gap-2 ${
            activeTab === 'today'
              ? 'bg-gray-800 dark:bg-gray-700 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
          <span>Сегодня</span>
          <span className="bg-white/20 px-1.5 rounded text-xs">{getTodayReminders().length}</span>
        </button>

        <button
          onClick={() => setActiveTab('overdue')}
          className={`px-3 sm:px-4 py-2.5 rounded-lg whitespace-nowrap text-sm min-h-[44px] flex items-center gap-2 ${
            activeTab === 'overdue'
              ? 'bg-gray-800 dark:bg-gray-700 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
          <span>Просроч</span>
          <span className="bg-white/20 px-1.5 rounded text-xs">{getOverdueReminders().length}</span>
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
              {/* Edit Mode */}
              {editingReminder?.id === reminder.id ? (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">✏️ Редактирование</h4>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Название"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={editForm.reminderDate}
                      onChange={(e) => setEditForm({ ...editForm, reminderDate: e.target.value })}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <input
                      type="time"
                      value={editForm.reminderTime}
                      onChange={(e) => setEditForm({ ...editForm, reminderTime: e.target.value })}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={saveEdit}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-sm"
                    >
                      💾 Сохранить
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 py-2 rounded-lg text-sm"
                    >
                      ✕ Отмена
                    </button>
                  </div>
                </div>
              ) : extendingReminder?.id === reminder.id ? (
                /* Extend Mode */
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">⏱️ Перенести напоминание</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {reminder.title}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => doExtend('1h')}
                      className="bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 py-2 rounded-lg text-sm font-medium"
                    >
                      +1 час
                    </button>
                    <button
                      onClick={() => doExtend('tomorrow')}
                      className="bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300 py-2 rounded-lg text-sm font-medium"
                    >
                      Завтра
                    </button>
                    <button
                      onClick={() => doExtend('dayafter')}
                      className="bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 py-2 rounded-lg text-sm font-medium"
                    >
                      Послезавтра
                    </button>
                  </div>
                  <button
                    onClick={cancelExtend}
                    className="w-full bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 py-2 rounded-lg text-sm"
                  >
                    ✕ Отмена
                  </button>
                </div>
              ) : (
                /* Normal View */
                <>
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
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => startEdit(reminder)}
                      className="flex-1 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 min-h-[44px] transition-colors"
                    >
                      ✏️ Изменить
                    </button>
                    <button
                      onClick={() => startExtend(reminder)}
                      className="flex-1 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 min-h-[44px] transition-colors"
                    >
                      ⏱️ Перенести
                    </button>
                    <button
                      onClick={() => handleDelete(reminder.id)}
                      className="px-3 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 py-2 rounded-lg text-sm min-h-[44px] transition-colors"
                      title="Удалить"
                    >
                      🗑️
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Info */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          ℹ️ Нажмите "Изменить" чтобы отредактировать название, дату или время. "Перенести" для быстрого сдвига срока.
        </p>
      </div>
    </div>
  );
};

export default RemindersView;
