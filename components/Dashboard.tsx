import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Task, Status, Priority } from '../types';

interface DashboardProps {
  tasks: Task[];
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const Dashboard: React.FC<DashboardProps> = ({ tasks }) => {
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === Status.COMPLETED).length;
    const inProgress = tasks.filter(t => t.status === Status.IN_PROGRESS).length;
    const hours = tasks.reduce((acc, curr) => acc + (curr.estimatedHours || 0), 0);
    
    // Data for charts
    const typeMap: Record<string, number> = {};
    const priorityMap: Record<string, number> = {};
    
    tasks.forEach(t => {
      typeMap[t.type] = (typeMap[t.type] || 0) + 1;
      priorityMap[t.priority] = (priorityMap[t.priority] || 0) + 1;
    });

    const typeData = Object.keys(typeMap).map(key => ({ name: key, value: typeMap[key] }));
    const priorityData = [
        { name: Priority.HIGH, value: priorityMap[Priority.HIGH] || 0 },
        { name: Priority.MEDIUM, value: priorityMap[Priority.MEDIUM] || 0 },
        { name: Priority.LOW, value: priorityMap[Priority.LOW] || 0 },
    ];

    return { total, completed, inProgress, hours, typeData, priorityData };
  }, [tasks]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Tareas', value: stats.total, color: 'text-orange-600' },
          { label: 'Completadas', value: stats.completed, color: 'text-green-600' },
          { label: 'En Progreso', value: stats.inProgress, color: 'text-blue-600' },
          { label: 'Total Horas', value: `${stats.hours}h`, color: 'text-purple-600' },
        ].map((stat, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
            <p className={`mt-2 text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Tareas por Prioridad</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.priorityData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{fill: 'transparent'}}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Tareas por Tipo</h3>
          <div className="h-64 w-full">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.typeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
       <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Próximos Vencimientos</h3>
           <div className="overflow-x-auto">
             <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
               <thead className="bg-slate-50 text-xs uppercase text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                 <tr>
                   <th className="px-6 py-3">Tarea</th>
                   <th className="px-6 py-3">Cliente/proyecto</th>
                   <th className="px-6 py-3">Fecha</th>
                   <th className="px-6 py-3">Estado</th>
                 </tr>
               </thead>
               <tbody>
                 {tasks
                   .filter(t => t.status !== Status.COMPLETED)
                   .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                   .slice(0, 5)
                   .map(task => (
                   <tr key={task.id} className="border-b border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/50">
                     <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{task.title}</td>
                     <td className="px-6 py-4">{task.client}</td>
                     <td className="px-6 py-4">{new Date(task.dueDate).toLocaleDateString('es-ES')}</td>
                     <td className="px-6 py-4">
                       <span className={`rounded-full px-2 py-1 text-xs font-semibold
                         ${task.status === Status.IN_PROGRESS ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : 
                           task.status === Status.REVIEW ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' :
                           'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'}`}>
                         {task.status}
                       </span>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
             {tasks.length === 0 && <p className="py-4 text-center">No hay tareas pendientes.</p>}
           </div>
       </div>
    </div>
  );
};
