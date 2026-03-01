import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Calendar, Trash2, Edit2 } from 'lucide-react';
import { useTasks } from '../../contexts/TaskContext';

const TaskCard = ({ task }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(task.description);
  const [editedDate, setEditedDate] = useState(
    task.date ? new Date(task.date).toISOString().split('T')[0] : ''
  );
  const [editedTime, setEditedTime] = useState(task.time || '');
  const [editedColor, setEditedColor] = useState(task.color || 'blue');
  
  const { deleteTask, updateTask } = useTasks();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
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

  const formatTime = (timeString) => {
    if (!timeString) return null;
    return timeString;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`card p-3 mb-3 cursor-pointer transition-all duration-200 touch-manipulation border-2 border-gray-200 dark:border-gray-700 ${
        isDragging ? 'shadow-2xl scale-105 z-50 border-primary-500' : 
        isOver ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700' :
        'hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            {/* Кнопка для перетаскивания на телефоне */}
            <div 
              className="touch-manipulation cursor-grab active:cursor-grabbing p-2 -ml-2 -my-2 rounded-lg active:bg-gray-100 dark:active:bg-gray-700"
              {...attributes}
              {...listeners}
              onTouchStart={(e) => e.stopPropagation()}
            >
              <GripVertical size={18} className="text-gray-400" />
            </div>
            
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="space-y-2">
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
                    className="input text-sm min-h-[60px]"
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
                      className="btn btn-primary text-sm px-3 py-1.5 flex-1"
                    >
                      Сохранить
                    </button>
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="btn btn-secondary text-sm px-3 py-1.5 flex-1"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h4 className="font-medium text-gray-900 dark:text-white truncate">
                    {task.title}
                  </h4>
                  {task.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <Calendar size={12} className="mr-1 flex-shrink-0" />
                      <span>{formatDate(task.date)}</span>
                      {task.time && (
                        <span className="ml-1 text-primary-500">{task.time}</span>
                      )}
                    </div>
                    
                    {task.tags?.map((tag, index) => (
                      <span 
                        key={index}
                        className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                    
                    {task.color && (
                      <span 
                        className={`text-xs px-2 py-0.5 rounded ${
                          task.color === 'blue' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                          task.color === 'purple' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' :
                          task.color === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                        }`}
                      >
                        {task.color}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
            
            {!isEditing && (
              <div className="flex flex-col gap-1 ml-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors active:scale-95"
                  title="Редактировать"
                >
                  <Edit2 size={16} className="text-gray-500 dark:text-gray-400" />
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors active:scale-95"
                  title="Удалить"
                >
                  <Trash2 size={16} className="text-red-500" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;