export enum Priority {
  HIGH = 'Alta',
  MEDIUM = 'Media',
  LOW = 'Baja',
}

export enum TaskType {
  DEVELOPMENT = 'Desarrollo',
  MANAGEMENT = 'Gestión',
  OFFERS = 'Ofertas',
  LT = 'LT',
  OTHER = 'Otros',
}

export enum Status {
  PENDING = 'Pendiente',
  IN_PROGRESS = 'En Progreso',
  REVIEW = 'En Revisión',
  COMPLETED = 'Completado',
}

export enum EventType {
  MEETING = 'Reunión',
  HOLIDAY = 'Vacaciones',
  COURSE = 'Curso',
  REMINDER = 'Recordatorio',
  OTHER = 'Otro',
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  type: TaskType;
  status: Status;
  client: string;
  estimatedHours: number;
  assignedUser?: string;
  createdAt: string; // ISO Date
  dueDate: string; // ISO Date
  notes?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string; // ISO Date
  endDate: string; // ISO Date
  type: EventType;
}

export interface FilterState {
  search: string;
  priority: Priority | 'Todas';
  type: TaskType | 'Todos';
  status: Status | 'Todos';
  client: string;
  dateStart?: string;
  dateEnd?: string;
}

export type ViewMode = 'dashboard' | 'kanban' | 'calendar' | 'list';