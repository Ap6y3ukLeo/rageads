import React from 'react';
import { Cloud, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useTasks } from '../../contexts/TaskContext';

const SyncStatus = () => {
  const { loading, tasks, user } = useTasks();

  if (!user) return null; // Не показываем, если нет пользователя

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-full shadow-lg px-4 py-2 border border-gray-200 dark:border-gray-700">
        {loading ? (
          <>
            <RefreshCw size={16} className="text-gray-500 animate-spin" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Синхронизация...
            </span>
          </>
        ) : (
          <>
            <CheckCircle size={16} className="text-green-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {tasks.length} задач синхронизировано
            </span>
          </>
        )}
        <Cloud size={16} className="text-red-500 ml-2" />
      </div>
    </div>
  );
};

export default SyncStatus;