import { FormEvent, useEffect, useState } from 'react';
import { CalendarView } from './components/CalendarView';
import { AIAssistant } from './components/AIAssistant';
import { SettingsPanel } from './components/SettingsPanel';
import { TodoList } from './components/TodoList';
import { Calendar, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  apiClient,
  User,
  Event as ApiEvent,
  Todo as ApiTodo,
  ReminderType,
  EventSource,
  CreateEventPayload,
  CreateTodoPayload
} from './api';

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  description?: string;
  color: string;
  source: EventSource;
  reminder?: {
    enabled: boolean;
    time: number; // minutes before event
    type: ReminderType;
  };
  tags?: string[];
}

export interface TodoItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
  category: 'day' | 'week' | 'general';
  createdAt: Date;
  tags?: string[];
}

export interface Habit {
  id: string;
  title: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  daysOfWeek?: number[]; // 0-6, Sunday-Saturday
  streak: number;
  lastCompleted?: Date;
  color: string;
  createdAt: Date;
}

export const DEFAULT_TAGS = [
  { name: 'Работа', color: '#3b82f6', icon: '💼' },
  { name: 'Учёба', color: '#10b981', icon: '📚' },
  { name: 'Семья', color: '#ec4899', icon: '👨‍👩‍👧' },
  { name: 'Покупки', color: '#f59e0b', icon: '🛒' },
  { name: 'Дом', color: '#8b5cf6', icon: '🏠' },
  { name: 'Здоровье', color: '#ef4444', icon: '❤️' },
  { name: 'Спорт', color: '#14b8a6', icon: '⚽' },
  { name: 'Досуг', color: '#f97316', icon: '🎮' },
];

export type ViewMode = 'day' | 'week' | 'month';
export type Theme = 'light' | 'dark';
export type MainTab = 'calendar' | 'todos';

export default function App() {
  const [mainTab, setMainTab] = useState<MainTab>('calendar');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [theme, setTheme] = useState<Theme>('light');
  const [integrations, setIntegrations] = useState({
    google: { connected: false, email: '' },
    yandex: { connected: false, email: '' }
  });
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(apiClient.isAuthenticated());
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authForm, setAuthForm] = useState({ email: '', username: '', password: '' });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [uiError, setUiError] = useState<string | null>(null);

  useEffect(() => {
    if (!uiError) return;
    const timeout = setTimeout(() => setUiError(null), 4000);
    return () => clearTimeout(timeout);
  }, [uiError]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const loadData = async () => {
      setDataLoading(true);
      try {
        const [currentUser, apiEvents, apiTodos] = await Promise.all([
          apiClient.getCurrentUser(),
          apiClient.getEvents(),
          apiClient.getTodos()
        ]);
        setUser(currentUser);
        setEvents(apiEvents.map(mapApiEventToCalendarEvent));
        setTodos(apiTodos.map(mapApiTodoToTodoItem));
      } catch (error) {
        console.error(error);
        setUiError('Не удалось загрузить данные. Попробуйте обновить страницу.');
      } finally {
        setDataLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated]);

  const handleAuthSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      if (authMode === 'register') {
        if (!authForm.username.trim()) {
          throw new Error('Введите имя пользователя');
        }
        await apiClient.register(authForm.email, authForm.username, authForm.password);
      }

      await apiClient.login(authForm.email, authForm.password);
      setIsAuthenticated(true);
    } catch (error) {
      console.error(error);
      setAuthError(extractErrorMessage(error));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    apiClient.logout();
    setUser(null);
    setEvents([]);
    setTodos([]);
    setHabits([]);
    setIsAuthenticated(false);
  };

  const addEvent = async (event: Omit<CalendarEvent, 'id'>) => {
    try {
      const payload = buildEventPayload(event);
      const created = await apiClient.createEvent(payload);
      setEvents((prev) => [...prev, mapApiEventToCalendarEvent(created)]);
    } catch (error) {
      console.error(error);
      setUiError('Не удалось создать событие');
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      await apiClient.deleteEvent(Number(id));
      setEvents((prev) => prev.filter((event) => event.id !== id));
    } catch (error) {
      console.error(error);
      setUiError('Не удалось удалить событие');
    }
  };

  const updateEvent = async (id: string, updatedEvent: Partial<CalendarEvent>) => {
    const current = events.find((event) => event.id === id);
    if (!current) return;

    try {
      const merged: CalendarEvent = { ...current, ...updatedEvent };
      const updated = await apiClient.updateEvent(Number(id), buildEventPayload(merged));
      setEvents((prev) =>
        prev.map((event) => (event.id === id ? mapApiEventToCalendarEvent(updated) : event))
      );
    } catch (error) {
      console.error(error);
      setUiError('Не удалось обновить событие');
    }
  };

  const addTodo = async (todo: Omit<TodoItem, 'id' | 'createdAt'>) => {
    try {
      const payload = buildTodoPayload(todo);
      const created = await apiClient.createTodo(payload);
      setTodos((prev) => [...prev, mapApiTodoToTodoItem(created)]);
    } catch (error) {
      console.error(error);
      setUiError('Не удалось создать задачу');
    }
  };

  const addMultipleTodos = async (newTodos: Omit<TodoItem, 'id' | 'createdAt'>[]) => {
    for (const todo of newTodos) {
      await addTodo(todo);
    }
  };

  const updateTodo = async (id: string, updates: Partial<TodoItem>) => {
    const current = todos.find((todo) => todo.id === id);
    if (!current) return;

    try {
      const merged: TodoItem = { ...current, ...updates };
      const updated = await apiClient.updateTodo(Number(id), buildTodoPayload(merged));
      setTodos((prev) =>
        prev.map((todo) => (todo.id === id ? mapApiTodoToTodoItem(updated) : todo))
      );
    } catch (error) {
      console.error(error);
      setUiError('Не удалось обновить задачу');
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      await apiClient.deleteTodo(Number(id));
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
    } catch (error) {
      console.error(error);
      setUiError('Не удалось удалить задачу');
    }
  };

  const addHabit = (habit: Omit<Habit, 'id' | 'createdAt' | 'streak' | 'lastCompleted'>) => {
    const newHabit: Habit = {
      ...habit,
      id: Date.now().toString(),
      createdAt: new Date(),
      streak: 0
    };
    setHabits((prev) => [...prev, newHabit]);
  };

  const updateHabit = (id: string, updates: Partial<Habit>) => {
    setHabits((prev) => prev.map((habit) => (habit.id === id ? { ...habit, ...updates } : habit)));
  };

  const deleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((habit) => habit.id !== id));
  };

  const addCustomTag = (tag: string) => {
    if (!customTags.includes(tag) && !DEFAULT_TAGS.find((t) => t.name === tag)) {
      setCustomTags((prev) => [...prev, tag]);
    }
  };

  const getAllTags = () => {
    return [...DEFAULT_TAGS.map((t) => t.name), ...customTags];
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-4">
        <form
          className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 space-y-4"
          onSubmit={handleAuthSubmit}
        >
          <h1 className="text-2xl font-semibold text-center text-gray-900">
            {authMode === 'login' ? 'Вход в Smart Calendar' : 'Регистрация'}
          </h1>

          {authError && (
            <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-2xl">
              {authError}
            </div>
          )}

          <div className="space-y-3">
            <label className="block text-sm text-gray-600">
              Email
              <input
                type="email"
                required
                value={authForm.email}
                onChange={(e) => setAuthForm((prev) => ({ ...prev, email: e.target.value }))}
                className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>

            {authMode === 'register' && (
              <label className="block text-sm text-gray-600">
                Имя пользователя
                <input
                  type="text"
                  required
                  value={authForm.username}
                  onChange={(e) => setAuthForm((prev) => ({ ...prev, username: e.target.value }))}
                  className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
            )}

            <label className="block text-sm text-gray-600">
              Пароль
              <input
                type="password"
                required
                value={authForm.password}
                onChange={(e) => setAuthForm((prev) => ({ ...prev, password: e.target.value }))}
                className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={authLoading}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:opacity-90 transition disabled:opacity-70"
          >
            {authLoading ? 'Подождите...' : authMode === 'login' ? 'Войти' : 'Создать аккаунт'}
          </button>

          <p className="text-center text-sm text-gray-600">
            {authMode === 'login' ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}{' '}
            <button
              type="button"
              className="text-blue-600 hover:underline"
              onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
            >
              {authMode === 'login' ? 'Зарегистрируйтесь' : 'Войдите'}
            </button>
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300 overflow-hidden">
        {/* Header */}
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 flex-shrink-0 relative">
          {dataLoading && (
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 animate-pulse" />
          )}
          <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div 
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-2xl"
                >
                  <Calendar className="w-5 h-5 text-white" />
                </motion.div>
                <div>
                  <h1 className="dark:text-white text-lg">Умный Календарь</h1>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {user && (
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400">В сети</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user.email}</p>
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition"
                >
                  Выйти
                </button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowSettings(true)}
                  className="p-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-2xl transition-all dark:text-white"
                >
                  <Settings className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </div>
        </header>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <SettingsPanel
              theme={theme}
              setTheme={setTheme}
              integrations={integrations}
              setIntegrations={setIntegrations}
              onClose={() => setShowSettings(false)}
            />
          )}
        </AnimatePresence>

        {uiError && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-3">
            <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-2 text-sm text-red-700">
              {uiError}
            </div>
          </div>
        )}

        {/* Main Tabs */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-1">
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMainTab('calendar')}
                className={`
                  px-6 py-3 text-sm transition-all relative rounded-t-2xl
                  ${mainTab === 'calendar'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }
                `}
              >
                📅 Календарь
                {mainTab === 'calendar' && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"
                  />
                )}
              </motion.button>
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMainTab('todos')}
                className={`
                  px-6 py-3 text-sm transition-all relative rounded-t-2xl
                  ${mainTab === 'todos'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }
                `}
              >
                ✅ Задачи
                {mainTab === 'todos' && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"
                  />
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 h-full">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
              {/* Main Content Area */}
              <div className="lg:col-span-2 h-full overflow-hidden">
                <AnimatePresence mode="wait">
                  {mainTab === 'calendar' && (
                    <motion.div
                      key="calendar"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                      className="h-full"
                    >
                      <CalendarView
                        events={events}
                        onAddEvent={addEvent}
                        onDeleteEvent={deleteEvent}
                        onUpdateEvent={updateEvent}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        theme={theme}
                        allTags={getAllTags()}
                        onAddCustomTag={addCustomTag}
                      />
                    </motion.div>
                  )}
                  {mainTab === 'todos' && (
                    <motion.div
                      key="todos"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                      className="h-full"
                    >
                      <TodoList
                        todos={todos}
                        onUpdateTodo={updateTodo}
                        onDeleteTodo={deleteTodo}
                        onAddTodo={addTodo}
                        theme={theme}
                        allTags={getAllTags()}
                        onAddCustomTag={addCustomTag}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* AI Assistant Section */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="lg:col-span-1 h-full overflow-hidden"
              >
                <AIAssistant
                  events={events}
                  todos={todos}
                  habits={habits}
                  onAddEvent={addEvent}
                  onDeleteEvent={deleteEvent}
                  onAddTodo={addTodo}
                  onAddMultipleTodos={addMultipleTodos}
                  onAddHabit={addHabit}
                  onUpdateHabit={updateHabit}
                  integrations={integrations}
                  theme={theme}
                  currentTab={mainTab}
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const formatTime = (date: Date) =>
  date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', hour12: false });

const combineDateAndTime = (date: Date, time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  const combined = new Date(date);
  combined.setHours(hours || 0, minutes || 0, 0, 0);
  return combined.toISOString();
};

const parseTags = (tags?: string | null) =>
  tags
    ? tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];

const stringifyTags = (tags?: string[]) =>
  tags && tags.length > 0 ? tags.filter(Boolean).join(',') : undefined;

const mapApiEventToCalendarEvent = (event: ApiEvent): CalendarEvent => {
  const start = new Date(event.start_time);
  const end = new Date(event.end_time);

  return {
    id: String(event.id),
    title: event.title,
    date: start,
    startTime: formatTime(start),
    endTime: formatTime(end),
    description: event.description || undefined,
    color: event.color || '#3b82f6',
    source: (event.source as EventSource) || 'local',
    reminder: event.reminder_enabled
      ? {
          enabled: event.reminder_enabled,
          time: event.reminder_time ?? 15,
          type: (event.reminder_type as ReminderType) || 'notification'
        }
      : undefined,
    tags: parseTags(event.tags)
  };
};

const buildEventPayload = (event: CalendarEvent | Omit<CalendarEvent, 'id'>): CreateEventPayload => ({
  title: event.title,
  description: event.description,
  start_time: combineDateAndTime(event.date, event.startTime),
  end_time: combineDateAndTime(event.date, event.endTime),
  color: event.color,
  source: event.source,
  reminder_enabled: event.reminder?.enabled ?? false,
  reminder_time: event.reminder?.time ?? 15,
  reminder_type: event.reminder?.type ?? 'notification',
  tags: stringifyTags(event.tags)
});

const mapApiTodoToTodoItem = (todo: ApiTodo): TodoItem => ({
  id: String(todo.id),
  title: todo.title,
  description: todo.description || undefined,
  completed: todo.completed,
  dueDate: todo.due_date ? new Date(todo.due_date) : undefined,
  priority: (todo.priority as TodoItem['priority']) || 'medium',
  category: (todo.category as TodoItem['category']) || 'general',
  createdAt: new Date(todo.created_at),
  tags: parseTags(todo.tags)
});

const buildTodoPayload = (
  todo: Partial<TodoItem> & { title: string }
): CreateTodoPayload => ({
  title: todo.title,
  description: todo.description,
  completed: todo.completed ?? false,
  priority: todo.priority ?? 'medium',
  category: todo.category ?? 'general',
  due_date: todo.dueDate ? todo.dueDate.toISOString() : null,
  tags: stringifyTags(todo.tags)
});

const extractErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'object' && error && 'response' in error) {
    const err = error as { response?: { data?: { detail?: string } } };
    return err.response?.data?.detail || 'Произошла ошибка';
  }
  return 'Произошла ошибка';
};