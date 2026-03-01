import React from 'react';
import { Calendar, LayoutGrid, Sun, Moon, Plus, Bell } from 'lucide-react';

const Header = ({ view, setView, darkMode, toggleDarkMode, onAddTask }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">R</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                RageAds
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Планирование без стресса
              </p>
            </div>
          </div>

          {/* Остальной код без изменений */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setView('board')}
                className={`px-4 py-2 rounded-md flex items-center space-x-2 transition-all ${
                  view === 'board'
                    ? 'bg-white dark:bg-gray-700 shadow-sm text-red-600 dark:text-red-400 font-medium'
                    : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                <LayoutGrid size={18} />
                <span className="hidden sm:inline">Доска</span>
              </button>
              <button
                onClick={() => setView('reminders')}
                className={`px-4 py-2 rounded-md flex items-center space-x-2 transition-all ${
                  view === 'reminders'
                    ? 'bg-white dark:bg-gray-700 shadow-sm text-red-600 dark:text-red-400 font-medium'
                    : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                <Bell size={18} />
                <span className="hidden sm:inline">Напоминания</span>
              </button>
              <button
                onClick={() => setView('calendar')}
                className={`px-4 py-2 rounded-md flex items-center space-x-2 transition-all ${
                  view === 'calendar'
                    ? 'bg-white dark:bg-gray-700 shadow-sm text-red-600 dark:text-red-400 font-medium'
                    : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                <Calendar size={18} />
                <span className="hidden sm:inline">Календарь</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
                
                
                
                
                
              
              <button
                onClick={toggleDarkMode}
                className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label={darkMode ? "Включить светлую тему" : "Включить темную тему"}
              >
                {darkMode ? (
                  <Sun size={20} className="text-yellow-500" />
                ) : (
                  <Moon size={20} className="text-gray-600 dark:text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;