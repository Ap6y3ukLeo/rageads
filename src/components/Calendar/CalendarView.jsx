import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Calendar as CalendarIcon, Filter, List } from 'lucide-react';
import { useTasks } from '../../contexts/TaskContext';

// Настройка локализации
const localizer = momentLocalizer(moment);
moment.locale('ru');

const CalendarView = () => {
  const { tasks } = useTasks();
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());

  // Преобразуем задачи в события для календаря
  const events = tasks.map(task => ({
    id: task.id,
    title: task.title,
    start: new Date(task.date),
    end: new Date(new Date(task.date).getTime() + 60 * 60 * 1000), // +1 час
    desc: task.description,
    priority: task.priority,
    color: task.color,
    allDay: true
  }));

  // Цвета для приоритетов
  const eventStyleGetter = (event) => {
    const priorityColors = {
      high: '#ef4444',
      medium: '#f59e0b',
      low: '#10b981'
    };
    
    const color = priorityColors[event.priority] || '#3b82f6';
    
    return {
      style: {
        backgroundColor: `${color}20`,
        borderLeft: `4px solid ${color}`,
        color: '#1f2937',
        borderRadius: '6px',
        border: 'none',
        padding: '2px 8px'
      }
    };
  };

  // Компонент для отображения события
  const CustomEvent = ({ event }) => (
    <div className="p-1">
      <div className="font-medium truncate">{event.title}</div>
      {event.desc && (
        <div className="text-xs opacity-75 truncate">{event.desc}</div>
      )}
    </div>
  );

  // Компонент для тулбара
  const CustomToolbar = (toolbar) => {
    const goToBack = () => {
      toolbar.onNavigate('PREV');
    };

    const goToNext = () => {
      toolbar.onNavigate('NEXT');
    };

    const goToCurrent = () => {
      toolbar.onNavigate('TODAY');
    };

    return (
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <CalendarIcon className="mr-2" size={24} />
            Календарь задач
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {toolbar.label}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => toolbar.onView('month')}
              className={`px-3 py-1.5 text-sm rounded transition-colors ${
                view === 'month' 
                  ? 'bg-white dark:bg-gray-700 shadow-sm' 
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Месяц
            </button>
            <button
              onClick={() => toolbar.onView('week')}
              className={`px-3 py-1.5 text-sm rounded transition-colors ${
                view === 'week' 
                  ? 'bg-white dark:bg-gray-700 shadow-sm' 
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Неделя
            </button>
            <button
              onClick={() => toolbar.onView('day')}
              className={`px-3 py-1.5 text-sm rounded transition-colors ${
                view === 'day' 
                  ? 'bg-white dark:bg-gray-700 shadow-sm' 
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              День
            </button>
          </div>
          
          <button
            onClick={goToBack}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            ‹
          </button>
          <button
            onClick={goToCurrent}
            className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
          >
            Сегодня
          </button>
          <button
            onClick={goToNext}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            ›
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <CustomToolbar 
        label={moment(date).format('MMMM YYYY')}
        onNavigate={(action) => {
          if (action === 'PREV') setDate(moment(date).subtract(1, view).toDate());
          if (action === 'NEXT') setDate(moment(date).add(1, view).toDate());
          if (action === 'TODAY') setDate(new Date());
        }}
        onView={setView}
        view={view}
      />
      
      <div className="card p-4">
        <div className="h-[600px]">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            onView={setView}
            view={view}
            onNavigate={setDate}
            date={date}
            components={{
              toolbar: CustomToolbar,
              event: CustomEvent,
            }}
            eventPropGetter={eventStyleGetter}
            messages={{
              today: 'Сегодня',
              previous: 'Назад',
              next: 'Вперед',
              month: 'Месяц',
              week: 'Неделя',
              day: 'День',
              agenda: 'Список',
              date: 'Дата',
              time: 'Время',
              event: 'Событие',
              noEventsInRange: 'Нет задач на этот период',
              showMore: total => `+${total} еще`
            }}
          />
        </div>
      </div>
      
      {/* Легенда приоритетов */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
          <span>Высокий приоритет</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
          <span>Средний приоритет</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
          <span>Низкий приоритет</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;