import React, { useState, useEffect, useMemo } from 'react';
import { Icons } from './constants';
import { Task, CalendarEvent, ViewMode, FilterState, Priority, TaskType, Status } from './types';
import { dataService } from './services/dataService';
import { Dashboard } from './components/Dashboard';
import { KanbanBoard } from './components/KanbanBoard';
import { CalendarView } from './components/CalendarView';
import { ListView } from './components/ListView';
import { Modal } from './components/ui/Modal';
import { TaskForm } from './components/TaskForm';
import { EventForm } from './components/EventForm';
import { Button } from './components/ui/Button';

function App() {
  // --- State ---
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [view, setView] = useState<ViewMode>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  // Selection State
  const [isTypeSelectionOpen, setIsTypeSelectionOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString());

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    priority: 'Todas',
    type: 'Todos',
    status: 'Todos',
    client: '',
    dateStart: '',
    dateEnd: ''
  });

  // --- Effects ---
  useEffect(() => {
    dataService.init();
    refreshData();
    // Auto-collapse sidebar on small screens
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // --- Handlers ---
  const refreshData = () => {
    setTasks(dataService.getTasks());
    setEvents(dataService.getEvents());
  };

  const handleCreateTask = (taskData: any) => {
    if (editingTask) {
      dataService.updateTask({ ...editingTask, ...taskData });
    } else {
      dataService.addTask(taskData);
    }
    setIsTaskModalOpen(false);
    setEditingTask(null);
    refreshData();
  };

  const handleUpdateStatus = (updatedTask: Task) => {
    dataService.updateTask(updatedTask);
    refreshData();
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleDeleteTask = () => {
    if (editingTask) {
      dataService.deleteTask(editingTask.id);
      setIsTaskModalOpen(false);
      setEditingTask(null);
      refreshData();
    }
  }

  const handleCreateEvent = (eventData: any) => {
    if (editingEvent) {
      dataService.updateEvent({ ...editingEvent, ...eventData });
    } else {
      dataService.addEvent(eventData);
    }
    setIsEventModalOpen(false);
    setEditingEvent(null);
    refreshData();
  };

  const handleDeleteEvent = () => {
    if (editingEvent) {
      dataService.deleteEvent(editingEvent.id);
      setIsEventModalOpen(false);
      setEditingEvent(null);
      refreshData();
    }
  }

  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ tasks, events }, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "taskflow_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // --- Filtering ---
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        task.client.toLowerCase().includes(filters.search.toLowerCase());
      const matchesPriority = filters.priority === 'Todas' || task.priority === filters.priority;
      const matchesType = filters.type === 'Todos' || task.type === filters.type;
      const matchesStatus = filters.status === 'Todos' || task.status === filters.status;

      let matchesDate = true;
      if (filters.dateStart) {
        matchesDate = matchesDate && new Date(task.dueDate) >= new Date(filters.dateStart);
      }
      if (filters.dateEnd) {
        matchesDate = matchesDate && new Date(task.dueDate) <= new Date(filters.dateEnd);
      }

      return matchesSearch && matchesPriority && matchesType && matchesStatus && matchesDate;
    });
  }, [tasks, filters]);

  // --- Render Helpers ---
  const renderView = () => {
    switch (view) {
      case 'dashboard': return <Dashboard tasks={tasks} />;
      case 'kanban': return <KanbanBoard tasks={filteredTasks} onTaskUpdate={handleUpdateStatus} onEditTask={handleEditTask} />;
      case 'calendar': return (
        <CalendarView
          tasks={filteredTasks}
          events={events}
          onDateSelect={(date) => {
            setSelectedDate(date);
            setIsTypeSelectionOpen(true);
          }}
          onAddEvent={(date) => {
            setSelectedDate(date);
            setEditingEvent(null);
            setIsEventModalOpen(true);
          }}
          onEditTask={(task) => {
            setEditingTask(task);
            setIsTaskModalOpen(true);
          }}
          onEditEvent={(event) => {
            setEditingEvent(event);
            setIsEventModalOpen(true);
          }}
        />
      );
      case 'list': return <ListView tasks={filteredTasks} onEditTask={handleEditTask} />;
      default: return null;
    }
  };

  const NavItem = ({ mode, icon: Icon, label }: { mode: ViewMode, icon: any, label: string }) => (
    <button
      onClick={() => setView(mode)}
      className={`flex w-full items-center space-x-3 rounded-lg px-4 py-3 font-medium transition-colors ${view === mode ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'}`}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen w-full bg-slate-100 text-slate-900 transition-colors dark:bg-slate-900 dark:text-slate-100">

      {/* Sidebar - Conditionally rendered on desktop via CSS width transition */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 transform border-r border-slate-200 bg-white transition-all duration-300 dark:border-slate-800 dark:bg-slate-900 
          ${isSidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full w-64 lg:w-0 lg:translate-x-0 lg:overflow-hidden'}
        `}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-6 dark:border-slate-800">
          <div className="flex items-center gap-2 font-bold text-orange-600 dark:text-orange-400">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600 text-white">
              <Icons.LayoutDashboard className="h-5 w-5" />
            </div>
            <span className="text-xl whitespace-nowrap">Tablero DZD</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden">
            <Icons.X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <nav className="space-y-1 p-4">
          <NavItem mode="dashboard" icon={Icons.LayoutDashboard} label="Inicio" />
          <NavItem mode="list" icon={Icons.List} label="Lista de Tareas" />
          <NavItem mode="kanban" icon={Icons.KanbanSquare} label="Tablero Kanban" />
          <NavItem mode="calendar" icon={Icons.Calendar} label="Calendario" />
        </nav>

        {/* Client/Project List Section */}
        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Clientes/proyectos
          </h3>
          <div className="space-y-1">
            {(() => {
              const activeTasksByClient = filteredTasks
                .filter(t => t.status !== Status.COMPLETED)
                .reduce((acc, task) => {
                  const client = task.client || 'Sin cliente/proyecto';
                  acc[client] = (acc[client] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>);

              const sortedClients = Object.entries(activeTasksByClient)
                .sort((a, b) => b[1] - a[1]);

              if (sortedClients.length === 0) {
                return (
                  <p className="text-sm text-slate-400 dark:text-slate-500">
                    No hay tareas activas
                  </p>
                );
              }

              return sortedClients.map(([client, count]) => (
                <button
                  key={client}
                  onClick={() => setFilters({ ...filters, client })}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${
                    filters.client === client 
                      ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400' 
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span className="truncate">{client}</span>
                  <span className="ml-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-slate-200 px-1.5 text-xs font-medium dark:bg-slate-700">
                    {count}
                  </span>
                </button>
              ));
            })()}
          </div>
          {filters.client && (
            <button
              onClick={() => setFilters({ ...filters, client: '' })}
              className="mt-2 w-full rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
            >
              Limpiar filtro
            </button>
          )}
        </div>

      </aside>

      {/* Main Content */}
      <div className={`flex flex-1 flex-col overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : ''}`}>

        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900 lg:px-8">
          <div className="flex items-center">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="mr-4 rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">
              <Icons.Menu className="h-6 w-6" />
            </button>

            {/* Global Search Bar (Visible on all large screens) */}
            <div className="relative hidden md:block">
              <Icons.Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar tareas..."
                className="h-10 w-64 rounded-full border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm focus:border-orange-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" onClick={exportData} title="Exportar Datos">
              <Icons.Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsDarkMode(!isDarkMode)}>
              {isDarkMode ? <Icons.Sun className="h-5 w-5" /> : <Icons.Moon className="h-5 w-5" />}
            </Button>
            <Button onClick={() => { setEditingTask(null); setIsTaskModalOpen(true); }} icon={<Icons.Plus className="h-4 w-4" />}>
              <span className="hidden sm:inline">Nueva Tarea</span>
              <span className="sm:hidden">Nueva</span>
            </Button>
            <div className="h-8 w-8 rounded-full bg-orange-100 ring-2 ring-white dark:ring-slate-800">
              <img src="https://picsum.photos/100/100" alt="Avatar" className="h-full w-full rounded-full object-cover" />
            </div>
          </div>
        </header>

        {/* Advanced Filters Bar (Visible for List and Kanban) */}
        {(view === 'list' || view === 'kanban') && (
          <div className="flex flex-col gap-4 border-b border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-900 lg:flex-row lg:items-center lg:px-8">
            <div className="flex items-center text-sm font-medium text-slate-500">
              <Icons.Filter className="mr-2 h-4 w-4" /> Filtros:
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                className="rounded-lg border-0 bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-orange-500 dark:bg-slate-800 dark:text-slate-300"
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value as any })}
              >
                <option value="Todas">Prioridad: Todas</option>
                {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <select
                className="rounded-lg border-0 bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-orange-500 dark:bg-slate-800 dark:text-slate-300"
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value as any })}
              >
                <option value="Todos">Tipo: Todos</option>
                {Object.values(TaskType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select
                className="rounded-lg border-0 bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-orange-500 dark:bg-slate-800 dark:text-slate-300"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
              >
                <option value="Todos">Estado: Todos</option>
                {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Advanced Date Filters (Only shown in List View usually, or global) */}
            <div className="flex items-center gap-2 lg:ml-auto">
              <span className="text-xs text-slate-500">Desde:</span>
              <input
                type="date"
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                value={filters.dateStart || ''}
                onChange={(e) => setFilters({ ...filters, dateStart: e.target.value })}
              />
              <span className="text-xs text-slate-500">Hasta:</span>
              <input
                type="date"
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                value={filters.dateEnd || ''}
                onChange={(e) => setFilters({ ...filters, dateEnd: e.target.value })}
              />
              {(filters.dateStart || filters.dateEnd) && (
                <button
                  onClick={() => setFilters({ ...filters, dateStart: '', dateEnd: '' })}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>
        )}

        {/* View Content */}
        <main className="flex-1 overflow-auto bg-slate-100 p-4 dark:bg-slate-900/50 lg:p-8">
          <div className="mx-auto h-full max-w-7xl">
            {renderView()}
          </div>
        </main>
      </div>

      {/* Task Modal */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => { setIsTaskModalOpen(false); setEditingTask(null); }}
        title={editingTask ? 'Editar Tarea' : 'Crear Nueva Tarea'}
      >
        <TaskForm
          initialData={editingTask || { dueDate: selectedDate }}
          onSubmit={handleCreateTask}
          onCancel={() => { setIsTaskModalOpen(false); setEditingTask(null); }}
        />
        {editingTask && (
          <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-700">
            <Button variant="danger" size="sm" onClick={handleDeleteTask} className="w-full">
              Eliminar Tarea
            </Button>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isEventModalOpen}
        onClose={() => { setIsEventModalOpen(false); setEditingEvent(null); }}
        title={editingEvent ? 'Editar Evento' : 'Nuevo Evento'}
      >
        <EventForm
          initialData={editingEvent || { startDate: selectedDate, endDate: selectedDate }}
          onSubmit={handleCreateEvent}
          onCancel={() => { setIsEventModalOpen(false); setEditingEvent(null); }}
        />
        {editingEvent && (
          <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-700">
            <Button variant="danger" size="sm" onClick={handleDeleteEvent} className="w-full">
              Eliminar Evento
            </Button>
          </div>
        )}
      </Modal>

      {/* Type Selection Modal */}
      <Modal
        isOpen={isTypeSelectionOpen}
        onClose={() => setIsTypeSelectionOpen(false)}
        title="¿Qué deseas crear?"
      >
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => {
              setIsTypeSelectionOpen(false);
              setEditingTask(null); // Ensure clean state
              setIsTaskModalOpen(true);
            }}
            className="flex flex-col items-center justify-center p-6 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-orange-500 transition-all dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
          >
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-3 dark:bg-blue-900/30 dark:text-blue-400">
              <Icons.LayoutDashboard className="h-6 w-6" />
            </div>
            <span className="font-medium text-slate-900 dark:text-white">Nueva Tarea</span>
            <span className="text-xs text-slate-500 mt-1 center text-center">Para seguimiento de trabajo</span>
          </button>

          <button
            onClick={() => {
              setIsTypeSelectionOpen(false);
              setEditingEvent(null); // Ensure clean state
              setIsEventModalOpen(true);
            }}
            className="flex flex-col items-center justify-center p-6 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-orange-500 transition-all dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
          >
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mb-3 dark:bg-purple-900/30 dark:text-purple-400">
              <Icons.Calendar className="h-6 w-6" />
            </div>
            <span className="font-medium text-slate-900 dark:text-white">Nuevo Evento</span>
            <span className="text-xs text-slate-500 mt-1 text-center">Reuniones, vacaciones, etc.</span>
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default App;
