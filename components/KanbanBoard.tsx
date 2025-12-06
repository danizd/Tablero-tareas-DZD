import React, { useState } from 'react';
import { Task, Status, Priority } from '../types';
import { Icons } from '../constants';

interface KanbanBoardProps {
  tasks: Task[];
  onTaskUpdate: (task: Task) => void;
  onEditTask: (task: Task) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, onTaskUpdate, onEditTask }) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTaskId(id);
    e.dataTransfer.setData('taskId', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, status: Status) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    const task = tasks.find(t => t.id === taskId);
    if (task && task.status !== status) {
      onTaskUpdate({ ...task, status });
    }
    setDraggedTaskId(null);
  };

  const getPriorityColor = (p: Priority) => {
    switch (p) {
      case Priority.HIGH: return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      case Priority.MEDIUM: return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case Priority.LOW: return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="flex h-full flex-col overflow-x-auto pb-4 lg:flex-row lg:space-x-4 lg:overflow-hidden">
      {Object.values(Status).map((status) => {
        const columnTasks = tasks.filter(t => t.status === status);
        
        return (
          <div 
            key={status}
            className="mb-4 min-w-[300px] flex-1 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50 lg:mb-0"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status)}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-slate-700 dark:text-slate-200">{status}</h3>
              <span className="rounded-full bg-slate-200 px-2 py-1 text-xs font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                {columnTasks.length}
              </span>
            </div>
            
            <div className="flex flex-col space-y-3">
              {columnTasks.map(task => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onClick={() => onEditTask(task)}
                  className={`cursor-pointer rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-800
                    ${draggedTaskId === task.id ? 'opacity-50' : 'opacity-100'}
                  `}
                >
                  <div className="flex items-start justify-between">
                    <span className={`mb-2 inline-block rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide font-bold ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    {task.client && (
                        <span className="text-[10px] text-slate-400 font-medium">{task.client}</span>
                    )}
                  </div>
                  <h4 className="mb-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{task.title}</h4>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center space-x-1">
                      <Icons.Clock className="h-3 w-3" />
                      <span>{new Date(task.dueDate).toLocaleDateString('es-ES', {month:'short', day:'numeric'})}</span>
                    </div>
                     <div className="rounded bg-slate-100 px-1.5 py-0.5 dark:bg-slate-700">
                        {task.type}
                     </div>
                  </div>
                </div>
              ))}
              {columnTasks.length === 0 && (
                  <div className="flex h-24 items-center justify-center rounded-lg border-2 border-dashed border-slate-200 text-slate-400 dark:border-slate-700">
                      <p className="text-sm">Soltar aquí</p>
                  </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};