import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Capacitor } from '@capacitor/core';

const auth = supabase.auth;

const TaskContext = createContext();

export const useTasks = () => useContext(TaskContext);

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [syncing, setSyncing] = useState(false);
  
  // Используем useRef для предотвращения повторных вызовов
  const isInitialMount = useRef(true);

  // Константы для тестового пользователя
  const TEST_USER = {
    email: 'test1@rageads-test.com',
    password: 'Test123!' 
  };

  // 1. Функция инициализации сессии и входа
  const initializeAuth = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      console.log('🔄 Проверка сессии...');
      const { data: { session } } = await auth.getSession();
      
      if (session?.user) {
        console.log('✅ Сессия найдена:', session.user.email);
        setUser(session.user);
        await loadTasksFromSupabase(session.user.id);
      } else {
        console.log('🔄 Сессии нет, входим под тестовым пользователем...');
        await loginWithTestUser();
      }
    } catch (error) {
      console.error('❌ Ошибка инициализации:', error.message);
    } finally {
      setLoading(false); // Гарантированный сброс загрузки
    }
  };

  // 2. Жизненный цикл: запуск при старте и слушатели для Android
  useEffect(() => {
    // Первичный запуск
    initializeAuth(true);

    // Слушатель для Android (когда вернулись в приложение из фона)
    const handleResume = () => {
      if (document.visibilityState === 'visible') {
        console.log('📱 Приложение развернуто, обновляем данные...');
        initializeAuth(false); // Обновляем тихо в фоне
      }
    };

    document.addEventListener('visibilitychange', handleResume);
    window.addEventListener('focus', handleResume);

    // Подписка на изменение состояния авторизации (Supabase)
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Событие Auth:', event);
      
      if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
      }
      
      if (session?.user) {
        setUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setTasks([]);
        loginWithTestUser(); // Авто-вход при выходе
      }
    });

    // Очистка при размонтировании
    return () => {
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleResume);
      window.removeEventListener('focus', handleResume);
    };
  }, []); // Конец единственного useEffect

  // 3. Загрузка задач из Supabase
  const loadTasksFromSupabase = async (userId) => {
    if (!userId) { setLoading(false); return; }
    
    setLoading(true);
    try {
      console.log('📥 Загрузка задач из БД...');
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedTasks = (data || []).map(task => ({
        id: task.id,
        supabaseId: task.id,
        title: task.title,
        description: task.description,
        column: task.task_column,
        date: new Date(task.task_date),
        tags: task.tags || [],
        color: task.color || 'blue',
        createdAt: new Date(task.created_at),
        updatedAt: task.updated_at ? new Date(task.updated_at) : null
      }));

      setTasks(formattedTasks);
    } catch (error) {
      console.error('❌ Ошибка загрузки задач:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. Вход под тестовым пользователем №3
  const loginWithTestUser = async () => {
    console.log('🔐 Попытка входа под test3:', TEST_USER.email);
    
    try {
      const { data, error } = await auth.signInWithPassword({
        email: TEST_USER.email,
        password: TEST_USER.password
      });
      
      if (error) {
        console.error('❌ Ошибка входа под test3:', error.message);
        
        // Если пользователь не существует, создаем его
        if (error.message.includes('Invalid login credentials')) {
          console.log('🔄 Пользователь test3 не найден, создаем...');
          return await createTestUser();
        }
        
        throw error;
      }
      
      console.log('✅ Успешный вход под test3:', data.user.email);
      setUser(data.user);
      await loadTasksFromSupabase(data.user.id);
      return { success: true, user: data.user };
      
    } catch (error) {
      console.error('Критическая ошибка входа:', error.message);
      setLoading(false); // Добавить сюда
      return { success: false, error: error.message };
    }
  };

  // 4. Создание тестового пользователя №3
  const createTestUser = async () => {
    console.log('🛠️ Создание нового пользователя test3...');
    
    try {
      const { data, error } = await auth.signUp({
        email: TEST_USER.email,
        password: TEST_USER.password,
        options: {
          data: {
            name: 'Тестовый пользователь №3',
            is_test: true
          }
        }
      });
      
      if (error) {
        console.error('❌ Ошибка создания пользователя test3:', error.message);
        return { success: false, error: error.message };
      }
      
      if (data.user) {
        console.log('✅ Пользователь test3 создан!');
        
        // Теперь входим под ним
        const loginResult = await auth.signInWithPassword({
          email: TEST_USER.email,
          password: TEST_USER.password
        });
        
        if (loginResult.error) {
          console.error('❌ Ошибка входа после создания:', loginResult.error.message);
          return { success: false, error: loginResult.error.message };
        }
        
        console.log('✅ Успешный вход после создания test3');
        setUser(loginResult.data.user);
        await loadTasksFromSupabase(loginResult.data.user.id);
        return { success: true, user: loginResult.data.user };
      }
      
      return { success: false, error: 'Не удалось создать пользователя' };
      
    } catch (error) {
      console.error('❌ Ошибка при создании пользователя:', error.message);
      return { success: false, error: error.message };
    }
  };

  // 5. Функция анонимного входа (просто вызывает loginWithTestUser)
  const signInAnonymously = async () => {
    setLoading(true);
    const result = await loginWithTestUser();
    setLoading(false);
    return result;
  };

  // 6. Функция входа по email/паролю (для других пользователей)
  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      setUser(data.user);
      await loadTasksFromSupabase(data.user.id);
      return { success: true, user: data.user };
    } catch (error) {
      console.error('❌ Ошибка входа:', error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // 7. Функция выхода
  const signOut = async () => {
    try {
      await auth.signOut();
      setUser(null);
      setTasks([]);
      console.log('✅ Успешный выход');
      
      // После выхода сразу входим снова под test3
      setTimeout(async () => {
        await loginWithTestUser();
      }, 500);
      
      return { success: true };
    } catch (error) {
      console.error('Ошибка выхода:', error.message);
      return { success: false, error: error.message };
    }
  };

  // 8. Сохранение задачи в Supabase
  const saveTaskToSupabase = async (taskData, isUpdate = false) => {
    if (!user) {
      console.error('❌ Нет пользователя для сохранения задачи');
      return null;
    }

    try {
      const taskPayload = {
        user_id: user.id,
        title: taskData.title,
        description: taskData.description,
        task_column: taskData.column || 'todo',
        task_date: taskData.date?.toISOString() || new Date().toISOString(),
        tags: taskData.tags || [],
        color: taskData.color || 'blue',
        updated_at: new Date().toISOString()
      };

      let result;

      if (isUpdate && taskData.supabaseId) {
        // Обновление существующей задачи
        const { data, error } = await supabase
          .from('tasks')
          .update(taskPayload)
          .eq('id', taskData.supabaseId)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Создание новой задачи
        const { data, error } = await supabase
          .from('tasks')
          .insert([taskPayload])
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      console.log(`✅ Задача ${isUpdate ? 'обновлена' : 'создана'}:`, result.id);
      return result.id;
    } catch (error) {
      console.error('❌ Ошибка сохранения задачи в Supabase:', error.message);
      return null;
    }
  };

  // 9. Методы для задач с синхронизацией с Supabase
  const addTask = async (task) => {
    if (!user) {
      console.error('❌ Нет пользователя для добавления задачи');
      return null;
    }

    const tempId = Date.now().toString();
    const newTask = { 
      id: tempId,
      title: task.title,
      description: task.description,
      column: task.column || 'todo',
      date: task.date || new Date(),
      tags: task.tags || [],
      color: task.color || 'blue',
      createdAt: new Date(),
      isSyncing: true
    };

    // Сначала добавляем локально для быстрого отклика
    setTasks(prev => [newTask, ...prev]);

    // Затем синхронизируем с Supabase
    try {
      const supabaseId = await saveTaskToSupabase(newTask, false);
      if (supabaseId) {
        // Обновляем локальную задачу с реальным ID из Supabase
        setTasks(prev => prev.map(t => 
          t.id === tempId 
            ? { ...t, id: supabaseId, supabaseId, isSyncing: false }
            : t
        ));
        console.log('✅ Задача синхронизирована с Supabase');
        return { ...newTask, id: supabaseId, supabaseId };
      }
    } catch (error) {
      console.error('❌ Ошибка синхронизации:', error);
    }

    return newTask;
  };

  const updateTask = async (id, updates) => {
    const taskToUpdate = tasks.find(t => t.id === id);
    if (!taskToUpdate) return;

    // Локальное обновление
    const updatedTasks = tasks.map(t => 
      t.id === id 
        ? { ...t, ...updates, updatedAt: new Date(), isSyncing: true }
        : t
    );
    setTasks(updatedTasks);

    // Синхронизация с Supabase
    if (taskToUpdate.supabaseId) {
      try {
        await saveTaskToSupabase(
          { supabaseId: taskToUpdate.supabaseId, ...updates }, 
          true
        );
        setTasks(prev => prev.map(t => 
          t.id === id ? { ...t, isSyncing: false } : t
        ));
      } catch (error) {
        console.error('❌ Ошибка обновления в Supabase:', error);
      }
    }
  };

  const deleteTask = async (id) => {
    const taskToDelete = tasks.find(t => t.id === id);
    if (!taskToDelete) return;

    // Локальное удаление
    const updatedTasks = tasks.filter(t => t.id !== id);
    setTasks(updatedTasks);

    // Удаление из Supabase
    if (taskToDelete.supabaseId && user) {
      try {
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', taskToDelete.supabaseId)
          .eq('user_id', user.id);

        if (error) throw error;
        console.log('✅ Задача удалена из Supabase');
      } catch (error) {
        console.error('❌ Ошибка удаления из Supabase:', error);
      }
    }
  };

  const moveTask = async (id, column) => {
    await updateTask(id, { column });
  };

  // 10. Функции фильтрации
  const getTasksByColumn = (columnId) => {
    return tasks.filter(task => task.column === columnId);
  };

  const getTasksByDate = (date) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.date);
      return taskDate.toDateString() === date.toDateString();
    });
  };

  // 11. Экспорт/импорт
  const exportTasks = () => {
    try {
      const dataStr = JSON.stringify(tasks, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `rageads-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('✅ Экспорт завершен');
      return { success: true };
    } catch (error) {
      console.error('❌ Ошибка экспорта:', error);
      return { success: false, error: error.message };
    }
  };

  const importTasks = async (jsonData) => {
    try {
      const importedTasks = JSON.parse(jsonData);
      if (!Array.isArray(importedTasks)) {
        throw new Error('Неверный формат данных');
      }

      // Удаляем старые задачи из Supabase
      if (user && tasks.length > 0) {
        const taskIds = tasks.filter(t => t.supabaseId).map(t => t.supabaseId);
        if (taskIds.length > 0) {
          const { error } = await supabase
            .from('tasks')
            .delete()
            .in('id', taskIds);
          
          if (error) throw error;
        }
      }

      // Импортируем новые задачи
      const importPromises = importedTasks.map(async (task) => {
        const supabaseId = await saveTaskToSupabase(task, false);
        return {
          ...task,
          id: supabaseId || task.id,
          supabaseId,
          date: new Date(task.date),
          createdAt: task.createdAt ? new Date(task.createdAt) : new Date()
        };
      });

      const importedTasksWithIds = await Promise.all(importPromises);
      setTasks(importedTasksWithIds.filter(t => t.supabaseId));

      console.log('✅ Импорт завершен');
      return { success: true, count: importedTasksWithIds.length };
    } catch (error) {
      console.error('❌ Ошибка импорта:', error);
      return { success: false, error: error.message };
    }
  };

  const clearAllTasks = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить ВСЕ задачи? Это действие нельзя отменить.')) {
      return { success: false };
    }

    // Удаляем из Supabase
    if (user && tasks.length > 0) {
      const taskIds = tasks.filter(t => t.supabaseId).map(t => t.supabaseId);
      if (taskIds.length > 0) {
        const { error } = await supabase
          .from('tasks')
          .delete()
          .in('id', taskIds);
        
        if (error) {
          console.error('❌ Ошибка удаления из Supabase:', error);
          return { success: false, error: error.message };
        }
      }
    }

    // Очищаем локально
    setTasks([]);
    console.log('✅ Все задачи удалены');
    return { success: true };
  };

  return (
    <TaskContext.Provider value={{
      // Состояние
      tasks,
      loading,
      user,
      syncing,
      
      // Колонки
      columns: [
        { id: "todo", title: "📝 Сделать", color: "bg-red-100 dark:bg-red-900/30" },
        { id: "in-progress", title: "⚡ В процессе", color: "bg-yellow-100 dark:bg-yellow-900/30" },
        { id: "done", title: "✅ Готово", color: "bg-green-100 dark:bg-green-900/30" }
      ],
      
      // Методы для задач
      addTask,
      updateTask,
      deleteTask,
      moveTask,
      
      // Функции фильтрации
      getTasksByColumn,
      getTasksByDate,
      
      // Методы управления данными
      exportTasks,
      importTasks,
      clearAllTasks,
      
      // Методы аутентификации
      signInAnonymously,
      signIn,
      signOut,
      
      // Перезагрузка задач
      refreshTasks: () => user ? loadTasksFromSupabase(user.id) : null
    }}>
      {children}
    </TaskContext.Provider>
  );
};