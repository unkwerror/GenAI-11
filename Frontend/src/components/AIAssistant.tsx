import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Calendar, Trash2, Clock, Sparkles, ListTodo } from 'lucide-react';
import { CalendarEvent, TodoItem, Habit, Theme, MainTab } from '../App';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface AIAssistantProps {
  events: CalendarEvent[];
  todos: TodoItem[];
  habits: Habit[];
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  onDeleteEvent: (id: string) => void;
  onAddTodo: (todo: Omit<TodoItem, 'id' | 'createdAt'>) => void;
  onAddMultipleTodos: (todos: Omit<TodoItem, 'id' | 'createdAt'>[]) => void;
  onAddHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'streak' | 'lastCompleted'>) => void;
  onUpdateHabit: (id: string, updates: Partial<Habit>) => void;
  integrations: {
    google: { connected: boolean; email: string };
    yandex: { connected: boolean; email: string };
  };
  theme: Theme;
  currentTab: MainTab;
}

type TabType = 'events' | 'todos';

export function AIAssistant({ 
  events, 
  todos,
  habits,
  onAddEvent, 
  onDeleteEvent, 
  onAddTodo,
  onAddMultipleTodos,
  onAddHabit,
  onUpdateHabit,
  integrations, 
  theme,
  currentTab
}: AIAssistantProps) {
  const [activeTab, setActiveTab] = useState<TabType>('events');
  
  // Sync activeTab with currentTab from parent
  useEffect(() => {
    if (currentTab === 'calendar') setActiveTab('events');
    else if (currentTab === 'todos') setActiveTab('todos');
  }, [currentTab]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Привет! Я ваш ИИ-ассистент. Я могу помочь вам:\n\n📅 Создавать события и встречи\n✅ Планировать задачи и разбивать их на подзадачи\n\nПросто напишите, что вам нужно!',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    // Создание задач с подзадачами
    if (activeTab === 'todos' && (lowerMessage.includes('день рождения') || 
        lowerMessage.includes('подготовка') || lowerMessage.includes('запланируй'))) {
      
      // Симуляция JSON ответа от нейросети
      const tasksData = {
        mainTask: 'Подготовка к дню рождения друга',
        tasks: [
          { title: 'Купить подарок', priority: 'high' as const, category: 'day' as const, dueDate: new Date(Date.now() + 86400000) },
          { title: 'Заказать торт', priority: 'high' as const, category: 'day' as const, dueDate: new Date(Date.now() + 86400000 * 2) },
          { title: 'Купить открытку', priority: 'medium' as const, category: 'day' as const, dueDate: new Date(Date.now() + 86400000) },
          { title: 'Составить список гостей', priority: 'medium' as const, category: 'week' as const, dueDate: new Date(Date.now() + 86400000 * 3) },
          { title: 'Забронировать место', priority: 'high' as const, category: 'week' as const, dueDate: new Date(Date.now() + 86400000 * 4) },
          { title: 'Подготовить украшения', priority: 'low' as const, category: 'week' as const, dueDate: new Date(Date.now() + 86400000 * 5) },
          { title: 'Купить напитки', priority: 'medium' as const, category: 'day' as const, dueDate: new Date(Date.now() + 86400000 * 6) }
        ]
      };

      // Добавляем задачи
      onAddMultipleTodos(tasksData.tasks.map(task => ({
        title: task.title,
        completed: false,
        priority: task.priority,
        category: task.category,
        dueDate: task.dueDate
      })));

      return `✅ Отлично! Я создал план подготовки к дню рождения:\n\n📋 На сегодня:\n• Купить подарок\n• Купить открытку\n\n📋 На неделю:\n• Заказать торт (через 2 дня)\n• Составить список гостей\n• Забронировать место\n• Подготовить украшения\n• Купить напитки\n\nВсе задачи добавлены в список дел! 🎉`;
    }

    // Создание события
    if (activeTab === 'events' && (lowerMessage.includes('создай') || lowerMessage.includes('добавь') || 
        lowerMessage.includes('запланируй') || lowerMessage.includes('назначь'))) {
      const event = parseEventFromText(userMessage);
      if (event) {
        onAddEvent(event);
        return `✅ Отлично! Я создал событие "${event.title}" на ${event.date.toLocaleDateString('ru-RU')} в ${event.startTime}. ${event.reminder?.enabled ? `\n⏰ Напоминание установлено за ${event.reminder.time} минут до события.` : ''}\n\nСобытие добавлено в ваш календарь!`;
      }
    }

    // Список событий
    if (activeTab === 'events' && (lowerMessage.includes('какие события') || lowerMessage.includes('что запланировано') ||
        lowerMessage.includes('мои события') || lowerMessage.includes('расписание'))) {
      if (events.length === 0) {
        return 'У вас пока нет запланированных событий. Хотите создать новое?';
      }
      
      const upcomingEvents = events
        .filter(e => new Date(e.date) >= new Date())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5);

      let response = `📅 Ближайшие события:\n\n`;
      upcomingEvents.forEach(event => {
        response += `• ${event.title}\n  ${new Date(event.date).toLocaleDateString('ru-RU')} в ${event.startTime}\n`;
        if (event.reminder?.enabled) {
          response += `  ⏰ Напоминание за ${event.reminder.time} мин\n`;
        }
      });
      
      return response;
    }

    // Список задач
    if (activeTab === 'todos' && (lowerMessage.includes('задачи') || lowerMessage.includes('дела') || lowerMessage.includes('todo'))) {
      if (todos.length === 0) {
        return 'У вас пока нет задач. Опишите задачу, и я помогу разбить её на подзадачи!';
      }

      const activeTodos = todos.filter(t => !t.completed);
      let response = `✅ Активные задачи (${activeTodos.length}):\n\n`;
      
      const dayTasks = activeTodos.filter(t => t.category === 'day');
      const weekTasks = activeTodos.filter(t => t.category === 'week');
      
      if (dayTasks.length > 0) {
        response += `📋 На день:\n`;
        dayTasks.slice(0, 3).forEach(task => {
          response += `• ${task.title} (${task.priority === 'high' ? '🔴 Важно' : task.priority === 'medium' ? '🟡 Средне' : '🟢 Низко'})\n`;
        });
      }
      
      if (weekTasks.length > 0) {
        response += `\n📋 На неделю:\n`;
        weekTasks.slice(0, 3).forEach(task => {
          response += `• ${task.title} (${task.priority === 'high' ? '🔴 Важно' : task.priority === 'medium' ? '🟡 Средне' : '🟢 Низко'})\n`;
        });
      }

      return response;
    }

    // Свободное время
    if (lowerMessage.includes('свободное время') || lowerMessage.includes('когда свободен')) {
      return '🕐 Проверяю ваше расписание... У вас свободно время сегодня после 16:00, завтра с 10:00 до 12:00 и после 15:00. Хотите запланировать встречу?';
    }

    // Интеграции
    if (lowerMessage.includes('синхрониз') || lowerMessage.includes('google') || lowerMessage.includes('яндекс')) {
      const googleStatus = integrations.google.connected ? '✅ подключен' : '❌ не подключен';
      const yandexStatus = integrations.yandex.connected ? '✅ подключен' : '❌ не подключен';
      return `🔗 Статус интеграций:\n\nGoogle Calendar: ${googleStatus}\nЯндекс Календарь: ${yandexStatus}\n\nДля настройки интеграций откройте настройки.`;
    }

    // Помощь
    if (lowerMessage.includes('помощ') || lowerMessage.includes('что ты умеешь') || 
        lowerMessage.includes('команды')) {
      const tabHelp = {
        events: '📅 События:\n• "Создай встречу завтра в 15:00"\n• "Какие события запланированы?"\n• "Когда я свободен?"',
        todos: '✅ Задачи:\n• "У друга день рождения, запланируй подготовку"\n• "Покажи мои задачи"\n• Я автоматически разобью задачу на подзадачи!'
      };

      return `🤖 Вы в разделе: ${activeTab === 'events' ? 'События' : 'Задачи'}\n\n${tabHelp[activeTab]}\n\nПереключайтесь между вкладками для других функций!`;
    }

    // Дефолтный ответ
    return `🤔 Я понял, что вы хотите ${activeTab === 'events' ? 'что-то сделать с календарем' : 'создать задачу'}. Можете уточнить? Для справки напишите "помощь".`;
  };

  const parseEventFromText = (text: string): Omit<CalendarEvent, 'id'> | null => {
    // Простой парсинг событий из текста
    const lowerText = text.toLowerCase();
    
    // Попытка найти дату
    let eventDate = new Date();
    if (lowerText.includes('завтра')) {
      eventDate = new Date(Date.now() + 86400000);
    } else if (lowerText.includes('послезавтра')) {
      eventDate = new Date(Date.now() + 172800000);
    }

    // Попытка найти время
    const timeMatch = text.match(/(\d{1,2}):(\d{2})/);
    let startTime = '10:00';
    let endTime = '11:00';
    
    if (timeMatch) {
      startTime = `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`;
      const hour = parseInt(timeMatch[1]);
      endTime = `${(hour + 1).toString().padStart(2, '0')}:${timeMatch[2]}`;
    }

    // Попытка найти название события
    let title = 'Новое событие';
    const createWords = ['создай', 'добавь', 'запланируй', 'назначь', 'встреча', 'событие'];
    for (const word of createWords) {
      if (lowerText.includes(word)) {
        const parts = text.split(word);
        if (parts.length > 1) {
          title = parts[1].trim().split(/[.,!?]/)[0].trim() || 'Новое событие';
          break;
        }
      }
    }

    // Определяем напоминание
    const hasReminder = lowerText.includes('напомни') || lowerText.includes('напоминание');
    let reminderTime = 15;
    
    const reminderMatch = text.match(/за (\d+) минут/);
    if (reminderMatch) {
      reminderTime = parseInt(reminderMatch[1]);
    }

    return {
      title,
      date: eventDate,
      startTime,
      endTime,
      description: text,
      color: '#3b82f6',
      source: 'local',
      reminder: hasReminder ? {
        enabled: true,
        time: reminderTime,
        type: 'notification'
      } : undefined
    };
  };

  const parseHabitFromText = (text: string): Omit<Habit, 'id' | 'createdAt' | 'streak' | 'lastCompleted'> | null => {
    const lowerText = text.toLowerCase();
    
    let title = 'Новая привычка';
    const habitWords = ['привычка', 'привычку'];
    for (const word of habitWords) {
      if (lowerText.includes(word)) {
        const parts = text.split(word);
        if (parts.length > 1) {
          title = parts[1].trim().split(/[.,!?]/)[0].trim() || 'Новая привычка';
          break;
        }
      }
    }

    let frequency: 'daily' | 'weekly' | 'monthly' = 'daily';
    if (lowerText.includes('каждый день') || lowerText.includes('ежедневно')) {
      frequency = 'daily';
    } else if (lowerText.includes('каждую неделю') || lowerText.includes('еженедельно')) {
      frequency = 'weekly';
    } else if (lowerText.includes('каждый месяц') || lowerText.includes('ежемесячно')) {
      frequency = 'monthly';
    }

    const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    return {
      title,
      description: text,
      frequency,
      color
    };
  };

  const handleSend = () => {
    if (!input.trim()) return;

    // Добавляем сообщение пользователя
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Генерируем ответ ИИ
    const aiResponse = generateAIResponse(input);
    
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 500);

    setInput('');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg flex flex-col h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-t-3xl flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="bg-white/20 p-2 rounded-2xl">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-white text-sm">ИИ Ассистент</h3>
            <p className="text-xs text-white/80">Всегда готов помочь</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex gap-2 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`
              w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0
              ${message.sender === 'ai' 
                ? 'bg-gradient-to-br from-blue-600 to-purple-600' 
                : 'bg-gray-300 dark:bg-gray-600'
              }
            `}>
              {message.sender === 'ai' ? (
                <Bot className="w-4 h-4 text-white" />
              ) : (
                <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              )}
            </div>
            <div className={`
              flex-1 max-w-[80%] p-2 rounded-2xl whitespace-pre-line text-xs
              ${message.sender === 'ai' 
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100' 
                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
              }
            `}>
              {message.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-700 flex-shrink-0">
        <div className="flex gap-1 flex-wrap">
          {activeTab === 'events' && (
            <>
              <button
                onClick={() => setInput('Какие события запланированы?')}
                className="px-2.5 py-1.5 text-[10px] bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 dark:text-white rounded-full transition-all hover:scale-105"
              >
                <Calendar className="w-2 h-2 inline mr-0.5" />
                События
              </button>
              <button
                onClick={() => setInput('Когда я свободен?')}
                className="px-2.5 py-1.5 text-[10px] bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 dark:text-white rounded-full transition-all hover:scale-105"
              >
                <Clock className="w-2 h-2 inline mr-0.5" />
                Свободное время
              </button>
            </>
          )}
          {activeTab === 'todos' && (
            <>
              <button
                onClick={() => setInput('У друга день рождения, запланируй подготовку')}
                className="px-2.5 py-1.5 text-[10px] bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 dark:text-white rounded-full transition-all hover:scale-105"
              >
                <Sparkles className="w-2 h-2 inline mr-0.5" />
                Пример
              </button>
              <button
                onClick={() => setInput('Покажи мои задачи')}
                className="px-2.5 py-1.5 text-[10px] bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 dark:text-white rounded-full transition-all hover:scale-105"
              >
                <ListTodo className="w-2 h-2 inline mr-0.5" />
                Мои задачи
              </button>
            </>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={
              activeTab === 'events' 
                ? 'Создай встречу...' 
                : 'Опишите задачу...'
            }
            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSend}
            className="px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:shadow-lg transition-all hover:scale-105"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}