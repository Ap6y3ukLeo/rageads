import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { useTasks } from '../../contexts/TaskContext';
import TaskModal from '../UI/TaskModal';

const CalendarView = () => {
  const { tasks } = useTasks();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialColumn, setInitialColumn] = useState('todo');

  // Получить дни текущего месяца
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    
    const days = [];
    
    // Дни предыдущего месяца
    for (let i = startingDay - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      days.push({ date: d, isCurrentMonth: false });
    }
    
    // Дни текущего месяца
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    
    // Дни следующего месяца
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    
    return days;
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  // Получить задачи на конкретный день
  const getTasksForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter(task => {
      const taskDate = new Date(task.date).toISOString().split('T')[0];
      return taskDate === dateStr;
    });
  };

  // Проверить, является ли дата сегодняшней
  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Навигация по месяцам
  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Открыть модальное окно для добавления задачи
  const handleDateClick = (date) => {
    setSelectedDate(date);
    setInitialColumn('todo');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
  };

  // Получить цвет задачи
  const getTaskColor = (color) => {
    const colors = {
      blue: 'bg-blue-500',
      purple: 'bg-purple-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      red: 'bg-red-500',
      pink: 'bg-pink-500',
      black: 'bg-black',
      gray: 'bg-gray-500',
    };
    return colors[color] || 'bg-blue-500';
  };

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  return (
    <div className="space-y-4">
      {/* Заголовок и навигация */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <CalendarIcon className="text-primary-500" size={28} />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Календарь
          </h2>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={goToPrevMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronLeft size={24} className="text-gray-600 dark:text-gray-400" />
          </button>
          
          <button
            onClick={goToToday}
            className="px-3 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Сегодня
          </button>
          
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronRight size={24} className="text-gray-600 dark:text-gray-400" />
          </button>
          
          <span className="ml-2 text-lg font-semibold text-gray-900 dark:text-white min-w-[140px]">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
        </div>
      </div>

      {/* Названия дней недели */}
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day, index) => (
          <div 
            key={day} 
            className={`text-center text-sm font-medium py-2 ${
              index >= 5 
                ? 'text-red-500 dark:text-red-400' 
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{day[0]}</span>
          </div>
        ))}
      </div>

      {/* Сетка календаря */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const dayTasks = getTasksForDate(day.date);
          const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6;
          
          return (
            <div
              key={index}
              onClick={() => handleDateClick(day.date)}
              className={`
                min-h-[80px] sm:min-h-[100px] p-1 rounded-lg cursor-pointer transition-all
                ${day.isCurrentMonth 
                  ? 'bg-white dark:bg-gray-800' 
                  : 'bg-gray-50 dark:bg-gray-900'
                }
                ${isToday(day.date) 
                  ? 'ring-2 ring-primary-500' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }
                border border-gray-200 dark:border-gray-700
              `}
            >
              <div className="flex justify-between items-start">
                <span className={`
                  text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full
                  ${isToday(day.date) 
                    ? 'bg-primary-500 text-white' 
                    : day.isCurrentMonth
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-400 dark:text-gray-600'
                  }
                  ${isWeekend && day.isCurrentMonth ? 'text-red-500' : ''}
                `}>
                  {day.date.getDate()}
                </span>
                
                {dayTasks.length > 0 && (
                  <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded-full">
                    {dayTasks.length}
                  </span>
                )}
              </div>
              
              <div className="mt-1 space-y-1 max-h-[60px] sm:max-h-[80px] overflow-y-auto">
                {dayTasks.slice(0, 3).map(task => (
                  <div
                    key={task.id}
                    className={`
                      text-xs p-1 rounded truncate text-white
                      ${getTaskColor(task.color)}
                    `}
                    title={task.title}
                  >
                    {task.title}
                  </div>
                ))}
                {dayTasks.length > 3 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    +{dayTasks.length - 3}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Список задач на выбранный день или сегодня */}
      <div className="card p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Задачи на сегодня
        </h3>
        {(() => {
          const todayTasks = getTasksForDate(new Date());
          if (todayTasks.length === 0) {
            return (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                На сегодня задач нет
              </p>
            );
          }
          return (
            <div className="space-y-2">
              {todayTasks.map(task => (
                <div
                  key={task.id}
                  className={`
                    p-3 rounded-lg border-l-4 bg-gray-50 dark:bg-gray-700
                    ${getTaskColor(task.color)} border-l-current
                  `}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {task.description}
                        </p>
                      )}
                    </div>
                    {task.time && (
                      <span className="text-sm text-primary-500 font-medium">
                        {task.time}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      {/* Кнопка добавления задачи */}
      <button
        onClick={() => {
          setSelectedDate(new Date());
          setIsModalOpen(true);
        }}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center active:scale-95"
        title="Добавить задачу"
      >
        <Plus size={28} />
      </button>

      {isModalOpen && (
        <TaskModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          initialColumn={initialColumn}
          initialDate={selectedDate}
        />
      )}
    </div>
  );
};

export default CalendarView;
