// Утилиты для работы с хранилищем
export const storage = {
  // Сохранение задач
  saveTasks: (tasks, userId = 'default') => {
    try {
      const key = `rageads-tasks-${userId}`;
      localStorage.setItem(key, JSON.stringify(tasks));
      console.log('✅ Задачи сохранены:', tasks.length);
      return true;
    } catch (error) {
      console.error('❌ Ошибка сохранения:', error);
      return false;
    }
  },

  // Загрузка задач
  loadTasks: (userId = 'default') => {
    try {
      const key = `rageads-tasks-${userId}`;
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('❌ Ошибка загрузки:', error);
      return [];
    }
  },

  // Сохранение пользователя
  saveUser: (user) => {
    try {
      localStorage.setItem('rageads-user', JSON.stringify(user));
      return true;
    } catch (error) {
      console.error('❌ Ошибка сохранения пользователя:', error);
      return false;
    }
  },

  // Загрузка пользователя
  loadUser: () => {
    try {
      const saved = localStorage.getItem('rageads-user');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('❌ Ошибка загрузки пользователя:', error);
      return null;
    }
  },

  // Очистка данных
  clear: (userId = 'default') => {
    localStorage.removeItem(`rageads-tasks-${userId}`);
    localStorage.removeItem('rageads-user');
  }
};