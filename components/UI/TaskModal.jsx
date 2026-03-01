import React, { useState } from 'react';
import { X, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { useTasks } from '../../contexts/TaskContext';

const TaskModal = ({ isOpen, onClose, initialColumn, taskToEdit, initialDate }) => {
  const { addTask, updateTask } = useTasks();
  const [title, setTitle] = useState(taskToEdit?.title || '');
  const [description, setDescription] = useState(taskToEdit?.description || '');
  const [selectedDate, setSelectedDate] = useState(
    taskToEdit?.date ? new Date(taskToEdit.date).toISOString().split('T')[0] : 
    initialDate ? initialDate.toISOString().split('T')[0] :
    new Date().toISOString().split('T')[0]
  );
  const [selectedTime, setSelectedTime] = useState(
    taskToEdit?.time ? taskToEdit.time : ''
  );
  const [dateMode, setDateMode] = useState('picker'); // 'picker' или 'manual'
  const [manualDate, setManualDate] = useState(
    taskToEdit?.date ? new Date(taskToEdit.date).toISOString().split('T')[0] : 
    new Date().toISOString().split('T')[0]
  );
  const [color, setColor] = useState(taskToEdit?.color || 'blue');
  const isEditing = !!taskToEdit;

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const dateValue = dateMode === 'picker' ? selectedDate : manualDate;
    
    const taskData = {
      title,
      description,
      date: new Date(dateValue),
      time: selectedTime || null,
      color,
    };

    if (taskToEdit) {
      updateTask(taskToEdit.id, taskData);
    } else {
      addTask({ ...taskData, column: initialColumn || 'todo' });
    }
    
    onClose();
  };

  const colorOptions = [
    { value: 'blue', label: 'Синий', class: 'bg-blue-500' },
    { value: 'purple', label: 'Фиолетовый', class: 'bg-purple-500' },
    { value: 'green', label: 'Зеленый', class: 'bg-green-500' },
    { value: 'yellow', label: 'Желтый', class: 'bg-yellow-500' },
    { value: 'red', label: 'Красный', class: 'bg-red-500' },
    { value: 'pink', label: 'Розовый', class: 'bg-pink-500' },
    { value: 'black', label: 'Черный', class: 'bg-black' },
    { value: 'gray', label: 'Серый', class: 'bg-gray-500' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {taskToEdit ? 'Редактировать задачу' : 'Новая задача'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors active:scale-95"
            >
              <X size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Название задачи *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              placeholder="Что нужно сделать?"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Описание
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input min-h-[100px]"
              placeholder="Детали задачи..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <CalendarIcon size={16} className="mr-2" />
                Дата выполнения
              </label>
              <div className="flex gap-1 mb-2">
                <button
                  type="button"
                  onClick={() => setDateMode('picker')}
                  className={`flex-1 text-xs py-1 px-2 rounded-lg transition-colors ${
                    dateMode === 'picker' 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  Календарь
                </button>
                <button
                  type="button"
                  onClick={() => setDateMode('manual')}
                  className={`flex-1 text-xs py-1 px-2 rounded-lg transition-colors ${
                    dateMode === 'manual' 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  Вручную
                </button>
              </div>
              {dateMode === 'picker' ? (
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="input"
                />
              ) : (
                <input
                  type="text"
                  value={manualDate}
                  onChange={(e) => setManualDate(e.target.value)}
                  className="input"
                  placeholder="ГГГГ-ММ-ДД"
                />
              )}
            </div>

            {isEditing && (
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Clock size={16} className="mr-2" />
                  Время
                </label>
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="input"
                  placeholder="ЧЧ:ММ"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Цвет метки
            </label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setColor(option.value)}
                  className={`w-7 h-7 rounded-full ${option.class} ${
                    color === option.value ? 'ring-2 ring-offset-2 ring-primary-500' : ''
                  } active:scale-95`}
                  title={option.label}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1 active:scale-95"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1 active:scale-95"
              disabled={!title.trim()}
            >
              {taskToEdit ? 'Сохранить' : 'Добавить задачу'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;