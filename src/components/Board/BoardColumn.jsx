import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import TaskCard from './TaskCard';
import MobileTaskCard from './MobileTaskCard';
import { Plus } from 'lucide-react';
import { useTasks } from '../../contexts/TaskContext';

const BoardColumn = ({ column, onAddTask, isMobile = false }) => {
  const { getTasksByColumn } = useTasks();
  const tasks = getTasksByColumn(column.id);
  
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div 
      ref={isMobile ? null : setNodeRef}
      className={`column ${column.color} ${
        isOver && !isMobile ? 'ring-2 ring-primary-500 ring-offset-2' : ''
      } h-full flex flex-col`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
            {column.title}
          </h3>
          <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
            column.id === 'todo' ? 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-300' :
            column.id === 'in-progress' ? 'bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-300' :
            'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-300'
          }`}>
            {tasks.length}
          </span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-3 min-h-[100px]">
          {tasks.length === 0 ? (
            <div className={`text-center py-8 text-gray-400 dark:text-gray-500 rounded-lg border-2 border-dashed ${
              isOver && !isMobile ? 'border-primary-500 bg-primary-500/5' : 'border-gray-300 dark:border-gray-700'
            }`}>
              <div className="text-4xl mb-2">📭</div>
              <p className="text-sm">Нет задач</p>
              {!isMobile && (
                <p className="text-xs mt-1">Добавьте новую</p>
              )}
            </div>
          ) : (
            tasks.map(task => (
              <div key={task.id}>
                {isMobile ? (
                  <MobileTaskCard task={task} />
                ) : (
                  <TaskCard task={task} />
                )}
              </div>
            ))
          )}
        </div>
      </div>
      
      {isMobile && (
        <button
          onClick={() => onAddTask(column.id)}
          className="btn btn-primary w-full mt-4 flex items-center justify-center gap-2 py-3"
        >
          <Plus size={20} />
          Добавить задачу
        </button>
      )}
    </div>
  );
};

export default BoardColumn;