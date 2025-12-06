import React, { useState } from 'react';
import { Task, Priority, Status } from '../types';
import { Icons } from '../constants';

interface ListViewProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
}

type SortField = 'title' | 'client' | 'priority' | 'status' | 'dueDate' | 'type';

export const ListView: React.FC<ListViewProps> = ({ tasks, onEditTask }) => {
  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    // Priority custom sort
    if (sortField === 'priority') {
      const priorityWeight = { [Priority.HIGH]: 3, [Priority.MEDIUM]: 2, [Priority.LOW]: 1 };
      aValue = priorityWeight[a.priority] || 0;
      bValue = priorityWeight[b.priority] || 0;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const getPriorityBadge = (p: Priority) => {
    switch (p) {
        case Priority.HIGH: return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
        case Priority.MEDIUM: return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300';
        case Priority.LOW: return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300';
        default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusBadge = (s: Status) => {
      switch(s) {
          case Status.COMPLETED: return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300';
          case Status.IN_PROGRESS: return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300';
          case Status.REVIEW: return 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300';
          default: return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
      }
  }

  const Th: React.FC<{field: SortField, label: string}> = ({field, label}) => (
    <th 
        className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700/50"
        onClick={() => handleSort(field)}
    >
        <div className="flex items-center space-x-1">
            <span>{label}</span>
            <Icons.ArrowUpDown className={`h-3 w-3 ${sortField === field ? 'text-indigo-500' : 'text-slate-300'}`} />
        </div>
    </th>
  );

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-900/50">
            <tr>
              <Th field="title" label="Tarea" />
              <Th field="client" label="Cliente" />
              <Th field="type" label="Tipo" />
              <Th field="priority" label="Prioridad" />
              <Th field="status" label="Estado" />
              <Th field="dueDate" label="Entrega" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {sortedTasks.map((task) => (
              <tr 
                key={task.id} 
                onClick={() => onEditTask(task)}
                className="cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/30"
              >
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm font-medium text-slate-900 dark:text-white">{task.title}</div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                  {task.client}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-800 dark:bg-slate-700 dark:text-slate-300">
                        {task.type}
                    </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getPriorityBadge(task.priority)}`}>
                    {task.priority}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadge(task.status)}`}>
                    {task.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                  {new Date(task.dueDate).toLocaleDateString('es-ES')}
                </td>
              </tr>
            ))}
            {sortedTasks.length === 0 && (
                <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                        No se encontraron tareas con los filtros actuales.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};