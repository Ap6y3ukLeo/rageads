import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  TouchSensor,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import BoardColumn from './BoardColumn';
import TaskCard from './TaskCard';
import TaskModal from '../UI/TaskModal';
import { useTasks } from '../../contexts/TaskContext';
import { Plus, ZoomIn, ZoomOut } from 'lucide-react';

const BoardView = () => {
  const { tasks, columns, moveTask, setTasks } = useTasks();
  const [activeColumn, setActiveColumn] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [overId, setOverId] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [scale, setScale] = useState(1);

  // Определяем мобильное устройство
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Изменение масштаба
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 1.5));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.5));
  };

  // Датчики только для десктопа
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  );

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    setOverId(null);

    if (!over || isMobile) return;

    const activeTask = tasks.find(task => task.id === active.id);
    
    if (!activeTask) return;

    // Если перетащили в колонку
    if (columns.find(col => col.id === over.id)) {
      if (activeTask.column !== over.id) {
        moveTask(active.id, over.id);
      }
    } 
    // Если перетащили на другую задачу
    else {
      const overTask = tasks.find(task => task.id === over.id);
      if (overTask && activeTask.column === overTask.column) {
        // Сортируем внутри колонки
        const columnTasks = tasks.filter(task => task.column === activeTask.column);
        const oldIndex = columnTasks.findIndex(task => task.id === active.id);
        const newIndex = columnTasks.findIndex(task => task.id === over.id);
        
        if (oldIndex !== newIndex) {
          const newOrder = arrayMove(columnTasks, oldIndex, newIndex);
          
          setTasks(prevTasks => {
            const otherTasks = prevTasks.filter(task => task.column !== activeTask.column);
            return [...otherTasks, ...newOrder];
          });
        }
      } else if (overTask) {
        moveTask(active.id, overTask.column);
      }
    }
  };

  const handleAddTask = (columnId) => {
    setActiveColumn(columnId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setActiveColumn(null);
  };

  const activeTask = tasks.find(task => task.id === activeId);

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
        },
      },
    }),
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isMobile ? 'Задачи' : 'Доска задач'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {isMobile 
                ? 'Используйте стрелки для перемещения' 
                : 'Перетаскивайте задачи между колонками'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Кнопки масштаба */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={handleZoomOut}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Уменьшить"
              >
                <ZoomOut size={18} className="text-gray-600 dark:text-gray-400" />
              </button>
              <span className="text-xs text-gray-500 dark:text-gray-400 px-2 min-w-[40px] text-center">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Увеличить"
              >
                <ZoomIn size={18} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Всего задач: <span className="font-semibold">{tasks.length}</span>
            </div>
          </div>
        </div>
        
        {isMobile ? (
          // Мобильная версия - вертикальные колонки
          <div className="space-y-8">
            {columns.map(column => (
              <div key={column.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {column.title}
                  </h3>
                  <span className={`text-sm px-3 py-1 rounded-full ${
                    column.id === 'todo' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                    column.id === 'in-progress' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                  }`}>
                    {tasks.filter(t => t.column === column.id).length}
                  </span>
                </div>
                <BoardColumn 
                  column={column} 
                  onAddTask={handleAddTask}
                  isMobile={true}
                />
              </div>
            ))}
          </div>
        ) : (
          // Десктоп версия - горизонтальные колонки с drag-and-drop
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div 
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
            >
              {columns.map(column => (
                <BoardColumn 
                  key={column.id} 
                  column={column} 
                  onAddTask={handleAddTask}
                  isMobile={false}
                />
              ))}
            </div>
            
            <DragOverlay dropAnimation={dropAnimation}>
              {activeTask ? (
                <div className="opacity-80 rotate-1 shadow-2xl max-w-[300px]">
                  <TaskCard task={activeTask} />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
        
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {isMobile ? (
            <p>📱 Используйте стрелки ← → для перемещения задач</p>
          ) : (
            <p>💡 Зажмите ≡ чтобы перетащить задачу</p>
          )}
        </div>
      </div>

      {isModalOpen && (
        <TaskModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          initialColumn={activeColumn}
        />
      )}

      {/* Плавающая кнопка добавления задачи */}
      <button
        onClick={() => {
          setActiveColumn('todo');
          setIsModalOpen(true);
        }}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center active:scale-95"
        title="Добавить задачу"
      >
        <Plus size={28} />
      </button>
    </>
  );
};

export default BoardView;