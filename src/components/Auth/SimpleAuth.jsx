import React, { useState } from 'react';
import { useTasks } from '../../contexts/TaskContext';

const SimpleAuth = () => {
  const { user, signInAnonymously, signOut } = useTasks();
  const [loading, setLoading] = useState(false);

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          👤 {user.email}
        </div>
        <button
          onClick={signOut}
          className="btn btn-secondary text-sm px-3 py-1"
        >
          Выйти
        </button>
      </div>
    );
  }

  const handleAnonymousLogin = async () => {
    setLoading(true); // Включаем локальный индикатор загрузки
    try {
      await signInAnonymously(); // Вызываем функцию из контекста
      // После успешного выполнения, компонент должен перерисоваться,
      // так как `user` в контексте изменится, и условие `if (user)` станет true
    } catch (error) {
      console.error("Не удалось войти:", error);
      alert("Ошибка входа. Проверьте консоль.");
    } finally {
      setLoading(false); // ВЫКЛЮЧАЕМ локальный индикатор в любом случае
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={handleAnonymousLogin}
        disabled={loading}
        className="btn btn-primary"
      >
        {loading ? 'Вход...' : '🚀 Быстрый старт (без регистрации)'}
      </button>
      <p className="text-xs text-gray-500 text-center">
        Создается анонимный аккаунт. Данные будут синхронизироваться на всех устройствах.
      </p>
    </div>
  );
};

export default SimpleAuth;