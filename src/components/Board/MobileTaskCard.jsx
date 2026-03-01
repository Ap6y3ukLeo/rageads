import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Trash2, Edit2 } from 'lucide-react';
import { useTasks } from '../../contexts/TaskContext';

const MobileTaskCard = ({ task }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(task.description);
  const [editedDate, setEditedDate] = useState(
    task.date ? new Date(task.date).toISOString().split('T')[0] : ''
  );
  const [editedTime, setEditedTime] = useState(task.time || '');
  const [editedColor, setEditedColor] = useState(task.color || 'blue');
  
  const { deleteTask, updateTask, columns, moveTask } = useTasks();
  
  const currentColumnIndex = columns.findIndex(col => col.id === task.column);
  const canMoveLeft = currentColumnIndex > 0;
  const canMoveRight = currentColumnIndex < columns.length - 1;

  const handleMoveLeft = () => {
    if (canMoveLeft) {
      const prevColumn = columns[currentColumnIndex - 1];
      moveTask(task.id, prevColumn.id);
    }
  };

  const handleMoveRight = () => {
    if (canMoveRight) {
      const nextColumn = columns[currentColumnIndex + 1];
      moveTask(task.id, nextColumn.id);
    }
  };

  const handleSave = () => {
    updateTask(task.id, {
      title: editedTitle,
      description: editedDescription,
      date: new Date(editedDate),
      time: editedTime || null,
      color: editedColor
    });
    setIsEditing(false);
  };

  const colorOptions = [
    { value: 'blue', class: 'bg-blue-500' },
    { value: 'purple', class: 'bg-purple-500' },
    { value: 'green', class: 'bg-green-500' },
    { value: 'yellow', class: 'bg-yellow-500' },
    { value: 'red', class: 'bg-red-500' },
    { value: 'pink', class: 'bg-pink-500' },
    { value: 'black', class: 'bg-black' },
    { value: 'gray', class: 'bg-gray-500' },
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short'
    });
  };

  return (
    <div className="card p-4 mb-3 transition-all duration-200 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="input text-sm"
                placeholder="Название задачи"
                autoFocus
              />
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                className="input text-sm min-h-[80px]"
                placeholder="Описание"
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">Дата</label>
                  <input
                    type="date"
                    value={editedDate}
                    onChange={(e) => setEditedDate(e.target.value)}
                    className="input text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">Время</label>
                  <input
                    type="time"
                    value={editedTime}
                    onChange={(e) => setEditedTime(e.target.value)}
                    className="input text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">Цвет</label>
                <div className="flex gap-1 mt-1">
                  {colorOptions.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setEditedColor(option.value)}
                      className={`w-6 h-6 rounded-full ${option.class} ${
                        editedColor === option.value ? 'ring-2 ring-offset-1 ring-primary-500' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleSave}
                  className="btn btn-primary text-sm px-3 py-2 flex-1"
                >
                  Сохранить
                </button>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="btn btn-secondary text-sm px-3 py-2 flex-1"
                >
                  Отмена
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 dark:text-white text-base">
                    {task.title}
                  </h4>
                  {task.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {task.description}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    title="Редактировать"
                  >
                    <Edit2 size={18} className="text-gray-500 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                    title="Удалить"
                  >
                    <Trash2 size={18} className="text-red-500" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                {/* Стрелки для перемещения */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleMoveLeft}
                    disabled={!canMoveLeft}
                    className={`p-2 rounded-lg ${
                      canMoveLeft 
                        ? 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700' 
                        : 'opacity-30 cursor-not-allowed'
                    }`}
                    title="Переместить влево"
                  >
                    <ChevronLeft size={20} className="text-gray-600 dark:text-gray-400" />
                  </button>
                  
                  <button
                    onClick={handleMoveRight}
                    disabled={!canMoveRight}
                    className={`p-2 rounded-lg ${
                      canMoveRight 
                        ? 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700' 
                        : 'opacity-30 cursor-not-allowed'
                    }`}
                    title="Переместить вправо"
                  >
                    <ChevronRight size={20} className="text-gray-600 dark:text-gray-400" />
                  </button>
                </div>

                {/* Информация о задаче */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Calendar size={14} className="mr-1" />
                    {formatDate(task.date)}
                    {task.time && (
                      <span className="ml-1 text-primary-500">{task.time}</span>
                    )}
                  </div>
                  
                  {task.tags?.slice(0, 2).map((tag, index) => (
                    <span 
                      key={index}
                      className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileTaskCard;