import { useState } from 'react';
import { CalendarView } from './components/CalendarView';
import { AIAssistant } from './components/AIAssistant';
import { SettingsPanel } from './components/SettingsPanel';
import { TodoList } from './components/TodoList';
import { Calendar, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  description?: string;
  color: string;
  source: 'local' | 'google' | 'yandex';
  reminder?: {
    enabled: boolean;
    time: number; // minutes before event
    type: 'notification' | 'email' | 'both';
  };
  tags?: string[];
}

export interface TodoItem {
  id: string;
  title: string;
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
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: '1',
      title: 'Встреча с командой',
      date: new Date(2025, 10, 24, 10, 0),
      startTime: '10:00',
      endTime: '11:30',
      description: 'Обсуждение проекта',
      color: '#3b82f6',
      source: 'local',
      reminder: {
        enabled: true,
        time: 15,
        type: 'notification'
      },
      tags: ['Работа']
    },
    {
      id: '2',
      title: 'Презентация проекта',
      date: new Date(2025, 10, 24, 14, 0),
      startTime: '14:00',
      endTime: '15:30',
      description: 'Презентация для клиента',
      color: '#10b981',
      source: 'google',
      tags: ['Работа']
    },
    {
      id: '3',
      title: 'Тренировка',
      date: new Date(2025, 10, 24, 18, 0),
      startTime: '18:00',
      endTime: '19:30',
      description: 'Спортзал',
      color: '#14b8a6',
      source: 'local',
      tags: ['Спорт', 'Здоровье']
    }
  ]);

  const [todos, setTodos] = useState<TodoItem[]>([
    {
      id: '1',
      title: 'Купить подарок',
      completed: false,
      dueDate: new Date(2025, 10, 25),
      priority: 'high',
      category: 'day',
      createdAt: new Date(),
      tags: ['Покупки', 'Семья']
    }
  ]);

  const [habits, setHabits] = useState<Habit[]>([
    {
      id: '1',
      title: 'Утренняя зарядка',
      description: 'Делать зарядку каждый день',
      frequency: 'daily',
      streak: 5,
      lastCompleted: new Date(),
      color: '#10b981',
      createdAt: new Date()
    }
  ]);

  const [customTags, setCustomTags] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [theme, setTheme] = useState<Theme>('light');
  const [integrations, setIntegrations] = useState({
    google: { connected: false, email: '' },
    yandex: { connected: false, email: '' }
  });

  const addEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent = {
      ...event,
      id: Date.now().toString()
    };
    setEvents([...events, newEvent]);
  };

  const deleteEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
  };

  const updateEvent = (id: string, updatedEvent: Partial<CalendarEvent>) => {
    setEvents(events.map(e => e.id === id ? { ...e, ...updatedEvent } : e));
  };

  const addTodo = (todo: Omit<TodoItem, 'id' | 'createdAt'>) => {
    const newTodo: TodoItem = {
      ...todo,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setTodos([...todos, newTodo]);
  };

  const addMultipleTodos = (newTodos: Omit<TodoItem, 'id' | 'createdAt'>[]) => {
    const todosWithIds = newTodos.map((todo, index) => ({
      ...todo,
      id: (Date.now() + index).toString(),
      createdAt: new Date()
    }));
    setTodos([...todos, ...todosWithIds]);
  };

  const updateTodo = (id: string, updates: Partial<TodoItem>) => {
    setTodos(todos.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  const addHabit = (habit: Omit<Habit, 'id' | 'createdAt' | 'streak' | 'lastCompleted'>) => {
    const newHabit: Habit = {
      ...habit,
      id: Date.now().toString(),
      createdAt: new Date(),
      streak: 0
    };
    setHabits([...habits, newHabit]);
  };

  const updateHabit = (id: string, updates: Partial<Habit>) => {
    setHabits(habits.map(h => h.id === id ? { ...h, ...updates } : h));
  };

  const deleteHabit = (id: string) => {
    setHabits(habits.filter(h => h.id !== id));
  };

  const addCustomTag = (tag: string) => {
    if (!customTags.includes(tag) && !DEFAULT_TAGS.find(t => t.name === tag)) {
      setCustomTags([...customTags, tag]);
    }
  };

  const getAllTags = () => {
    return [...DEFAULT_TAGS.map(t => t.name), ...customTags];
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300 overflow-hidden">
        {/* Header */}
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
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
              <div className="flex items-center gap-2">
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