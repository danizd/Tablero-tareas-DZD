import React, { useState } from 'react';
import { Task, CalendarEvent } from '../types';
import { Icons } from '../constants';
import { Button } from './ui/Button';

interface CalendarViewProps {
  tasks: Task[];
  events: CalendarEvent[];
  onDateSelect: (date: string) => void;
  onAddEvent: (date: string) => void;
  onEditTask: (task: Task) => void;
  onEditEvent: (event: CalendarEvent) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ tasks, events, onDateSelect, onAddEvent, onEditTask, onEditEvent }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Adjust for Monday start (0=Sun -> 0=Mon)
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptySlots = Array.from({ length: startOffset }, (_, i) => i);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const getItemsForDate = (day: number) => {
    // Construct local date string YYYY-MM-DD manually to avoid timezone shifts
    const m = month + 1;
    const dateStr = `${year}-${m < 10 ? '0' + m : m}-${day < 10 ? '0' + day : day}`;

    const dayTasks = tasks.filter(t => t.dueDate.startsWith(dateStr));
    const dayEvents = events.filter(e => {
      // Handle ISO strings and YYYY-MM-DD formats
      const startStr = e.startDate.substring(0, 10);
      const endStr = e.endDate.substring(0, 10);
      return dateStr >= startStr && dateStr <= endStr;
    });
    return { dayTasks, dayEvents };
  };

  return (
    <div className="flex h-full flex-col rounded-xl bg-white shadow-sm dark:bg-slate-800">
      <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-700">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white capitalize">
          {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex space-x-2">
          <Button size="sm" onClick={() => onAddEvent(new Date().toISOString())} icon={<Icons.Plus className="h-4 w-4" />}>
            Evento
          </Button>
          <div className="w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
          <Button size="sm" variant="outline" onClick={prevMonth}>{'<'}</Button>
          <Button size="sm" variant="outline" onClick={goToday}>Hoy</Button>
          <Button size="sm" variant="outline" onClick={nextMonth}>{'>'}</Button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-semibold uppercase text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
          <div key={d} className="py-3">{d}</div>
        ))}
      </div>

      <div className="grid flex-1 grid-cols-7 auto-rows-fr">
        {emptySlots.map(i => (
          <div key={`empty-${i}`} className="border-b border-r border-slate-100 bg-slate-50/50 dark:border-slate-700 dark:bg-transparent" />
        ))}
        {days.map(day => {
          const { dayTasks, dayEvents } = getItemsForDate(day);
          const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();


          return (
            <div
              key={day}
              className={`group relative min-h-[100px] border-b border-r border-slate-100 p-2 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/30 ${isToday ? 'bg-orange-50/50 dark:bg-orange-900/10' : ''}`}
              onClick={() => onDateSelect(new Date(year, month, day).toISOString())}
            >
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-sm font-medium ${isToday ? 'bg-orange-600 text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                {day}
              </span>

              <div className="mt-2 space-y-1">
                {dayEvents.map(ev => (
                  <div
                    key={ev.id}
                    className="truncate rounded bg-purple-100 px-1 py-0.5 text-[10px] font-medium text-purple-800 dark:bg-purple-900 dark:text-purple-200 cursor-pointer hover:opacity-80"
                    onClick={(e) => { e.stopPropagation(); onEditEvent(ev); }}
                  >
                    {ev.title}
                  </div>
                ))}
                {dayTasks.map(task => (
                  <div
                    key={task.id}
                    className="truncate rounded bg-blue-100 px-1 py-0.5 text-[10px] font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200 cursor-pointer hover:opacity-80"
                    onClick={(e) => { e.stopPropagation(); onEditTask(task); }}
                  >
                    {task.title}
                  </div>
                ))}
              </div>

              <button
                className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100"
                onClick={(e) => { e.stopPropagation(); onDateSelect(new Date(year, month, day).toISOString()); }}
              >
                <Icons.Plus className="h-4 w-4 text-slate-400" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
