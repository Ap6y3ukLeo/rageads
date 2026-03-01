import React, { useRef } from 'react';
import { useTasks } from '../../contexts/TaskContext';
import { Download, Upload, Trash2, Database } from 'lucide-react';

const DataManager = () => {
  const { tasks, exportTasks, importTasks, clearAllTasks, user } = useTasks();
  const fileInputRef = useRef(null);

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const success = importTasks(e.target.result);
      if (success) {
        alert('Данные успешно импортированы!');
      } else {
        alert('Ошибка импорта. Проверьте формат файла.');
      }
    };
    reader.readAsText(file);
  };

  if (!user) return null;

  
    
  
};

export default DataManager;