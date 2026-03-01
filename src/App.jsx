import React, { useState } from 'react';
import { TaskProvider, useTasks } from './contexts/TaskContext';
import Header from './components/Layout/Header';
import BoardView from './components/Board/BoardView';
import CalendarView from './components/Calendar/CalendarView';
import SimpleAuth from './components/Auth/SimpleAuth';
import SyncStatus from './components/UI/SyncStatus';
import DataManager from './components/UI/DataManager';
import './index.css';

// Этот компонент использует useTasks ВНУТРИ TaskProvider
const AppContent = () => {
  const [view, setView] = useState('board');
  const [darkMode, setDarkMode] = useState(false);
  const { user, loading } = useTasks(); // Теперь это работает!

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header 
          view={view} 
          setView={setView} 
          darkMode={darkMode}
          toggleDarkMode={() => setDarkMode(!darkMode)}
        />
        
        <main className="container mx-auto px-4 py-8">
          {!user && !loading ? (
            <div className="max-w-md mx-auto mt-12">
              <div className="card p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Добро пожаловать в RageAds v0.6.0!
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Данные сохраняются автоматически между сессиями
                </p>
                <SimpleAuth />
              </div>
            </div>
          ) : loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Загрузка...</p>
            </div>
          ) : view === 'board' ? (
            <BoardView />
          ) : (
            <CalendarView />
          )}
        </main>

        <DataManager />
        <SyncStatus />
        
        <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400 text-sm">
            <p>RageAds v0.6.0 • Автосохранение • {user ? `👤 ${user.email}` : 'Не авторизован'}</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

// Основной компонент App оборачивает все в TaskProvider
function App() {
  return (
    <TaskProvider>
      <AppContent />
    </TaskProvider>
  );
}

export default App;