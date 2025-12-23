import React, { useState, useEffect } from 'react';
import { Task, Priority, TaskType, Status } from '../types';
import { Button } from './ui/Button';

interface TaskFormProps {
  initialData?: Partial<Task>;
  onSubmit: (task: any) => void;
  onCancel: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: Priority.MEDIUM,
    type: TaskType.DEVELOPMENT,
    status: Status.PENDING,
    client: '',
    estimatedHours: 1,
    dueDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        dueDate: initialData.dueDate ? initialData.dueDate.split('T')[0] : prev.dueDate
      }));
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
        ...formData,
        estimatedHours: Number(formData.estimatedHours)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Título</label>
        <input
          required
          type="text"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          value={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Tipo</label>
          <select
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            value={formData.type}
            onChange={e => setFormData({ ...formData, type: e.target.value as TaskType })}
          >
            {Object.values(TaskType).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Prioridad</label>
          <select
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            value={formData.priority}
            onChange={e => setFormData({ ...formData, priority: e.target.value as Priority })}
          >
            {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
         <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Cliente/proyecto</label>
          <input
            type="text"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            value={formData.client}
            onChange={e => setFormData({ ...formData, client: e.target.value })}
          />
        </div>
         <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Horas Est.</label>
          <input
            type="number"
            min="0"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            value={formData.estimatedHours}
            onChange={e => setFormData({ ...formData, estimatedHours: Number(e.target.value) })}
          />
        </div>
      </div>

       <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Fecha de Entrega</label>
        <input
          type="date"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          value={formData.dueDate}
          onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Descripción</label>
        <textarea
          rows={3}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar Tarea</Button>
      </div>
    </form>
  );
};
