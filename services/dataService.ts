import { Task, CalendarEvent, Priority, TaskType, Status, EventType } from '../types';
import { MOCK_TASKS, MOCK_EVENTS } from '../constants';

// Keys for LocalStorage
const TASKS_KEY = 'taskflow_tasks';
const EVENTS_KEY = 'taskflow_events';

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class DataService {
  init() {
    if (!localStorage.getItem(TASKS_KEY)) {
      localStorage.setItem(TASKS_KEY, JSON.stringify(MOCK_TASKS));
    }
    if (!localStorage.getItem(EVENTS_KEY)) {
      localStorage.setItem(EVENTS_KEY, JSON.stringify(MOCK_EVENTS));
    }
  }

  getTasks(): Task[] {
    const data = localStorage.getItem(TASKS_KEY);
    return data ? JSON.parse(data) : [];
  }

  saveTasks(tasks: Task[]) {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  }

  getEvents(): CalendarEvent[] {
    const data = localStorage.getItem(EVENTS_KEY);
    return data ? JSON.parse(data) : [];
  }

  saveEvents(events: CalendarEvent[]) {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  }

  addTask(task: Omit<Task, 'id' | 'createdAt'>): Task {
    const tasks = this.getTasks();
    const newTask: Task = {
      ...task,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
    tasks.push(newTask);
    this.saveTasks(tasks);
    return newTask;
  }

  updateTask(updatedTask: Task) {
    const tasks = this.getTasks();
    const index = tasks.findIndex(t => t.id === updatedTask.id);
    if (index !== -1) {
      tasks[index] = updatedTask;
      this.saveTasks(tasks);
    }
  }

  deleteTask(id: string) {
    const tasks = this.getTasks().filter(t => t.id !== id);
    this.saveTasks(tasks);
  }

  addEvent(event: Omit<CalendarEvent, 'id'>): CalendarEvent {
    const events = this.getEvents();
    const newEvent: CalendarEvent = {
      ...event,
      id: Math.random().toString(36).substr(2, 9),
    };
    events.push(newEvent);
    this.saveEvents(events);
    return newEvent;
  }

  updateEvent(updatedEvent: CalendarEvent) {
    const events = this.getEvents();
    const index = events.findIndex(e => e.id === updatedEvent.id);
    if (index !== -1) {
      events[index] = updatedEvent;
      this.saveEvents(events);
    }
  }

  deleteEvent(id: string) {
    const events = this.getEvents().filter(e => e.id !== id);
    this.saveEvents(events);
  }
}

export const dataService = new DataService();