import { useState } from 'react';
import { CheckCircle2, Circle, Trash2, Calendar as CalendarIcon, AlertCircle, Plus, Sparkles } from 'lucide-react';
import { TodoItem, Theme, DEFAULT_TAGS } from '../App';
import { TodoModal } from './TodoModal';
import { motion, AnimatePresence } from 'motion/react';

interface TodoListProps {
  todos: TodoItem[];
  onUpdateTodo: (id: string, updates: Partial<TodoItem>) => void;
  onDeleteTodo: (id: string) => void;
  onAddTodo: (todo: Omit<TodoItem, 'id' | 'createdAt'>) => void;
  theme: Theme;
  allTags: string[];
  onAddCustomTag: (tag: string) => void;
}

export function TodoList({ todos, onUpdateTodo, onDeleteTodo, onAddTodo, theme, allTags, onAddCustomTag }: TodoListProps) {
  const [filter, setFilter] = useState<'all' | 'day' | 'week' | 'general'>('all');
  const [showTodoModal, setShowTodoModal] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<TodoItem | null>(null);

  const filteredTodos = filter === 'all' 
    ? todos 
    : todos.filter(t => t.category === filter);

  const sortedTodos = [...filteredTodos].sort((a, b) => {
    // Sort by completed status first
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    // Then by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-rose-600 dark:text-rose-400';
      case 'medium': return 'text-amber-600 dark:text-amber-400';
      case 'low': return 'text-emerald-600 dark:text-emerald-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getPriorityBg = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/30';
      case 'medium': return 'bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30';
      case 'low': return 'bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30';
      default: return 'bg-gray-100 dark:bg-gray-700';
    }
  };

  const isOverdue = (todo: TodoItem) => {
    if (!todo.dueDate || todo.completed) return false;
    return new Date(todo.dueDate) < new Date();
  };

  const stats = {
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    day: todos.filter(t => t.category === 'day' && !t.completed).length,
    week: todos.filter(t => t.category === 'week' && !t.completed).length
  };

  const completionPercentage = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-gray-800/50 rounded-3xl shadow-xl p-6 h-full flex flex-col backdrop-blur-sm"
    >
      {/* Header with Sparkle Icon */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <motion.div 
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-3xl shadow-lg"
          >
            <Sparkles className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h3 className="dark:text-white">Мои задачи</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              {stats.completed} из {stats.total} выполнено • {Math.round(completionPercentage)}%
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setSelectedTodo(null);
            setShowTodoModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:shadow-lg transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          Добавить
        </motion.button>
      </div>

      {/* Filters with Rounded Pills */}
      <div className="flex gap-2 mb-4 flex-wrap flex-shrink-0">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setFilter('all')}
          className={`
            px-4 py-2 text-sm rounded-full transition-all shadow-sm
            ${filter === 'all' 
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
              : 'bg-white/60 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700'
            }
          `}
        >
          Все ({todos.length})
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setFilter('day')}
          className={`
            px-4 py-2 text-sm rounded-full transition-all shadow-sm
            ${filter === 'day' 
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
              : 'bg-white/60 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700'
            }
          `}
        >
          📅 День ({todos.filter(t => t.category === 'day').length})
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setFilter('week')}
          className={`
            px-4 py-2 text-sm rounded-full transition-all shadow-sm
            ${filter === 'week' 
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
              : 'bg-white/60 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700'
            }
          `}
        >
          📆 Неделя ({todos.filter(t => t.category === 'week').length})
        </motion.button>
      </div>

      {/* Todo List with Animations */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        <AnimatePresence mode="popLayout">
          {sortedTodos.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-12"
            >
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-3xl p-8 inline-block">
                <Sparkles className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
                <p className="text-gray-700 dark:text-gray-300">Задач пока нет</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Попросите ИИ-ассистента создать задачи!
                </p>
              </div>
            </motion.div>
          ) : (
            sortedTodos.map((todo, index) => (
              <motion.div
                key={todo.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                layout
                onClick={() => {
                  setSelectedTodo(todo);
                  setShowTodoModal(true);
                }}
                className={`
                  flex items-start gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer group
                  ${todo.completed 
                    ? 'bg-gray-50/50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-700 opacity-60' 
                    : 'bg-white/80 dark:bg-gray-700/50 border-gray-200/50 dark:border-gray-600/50 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 backdrop-blur-sm'
                  }
                  ${isOverdue(todo) ? 'border-rose-300 dark:border-rose-700 bg-rose-50/50 dark:bg-rose-900/10' : ''}
                `}
              >
                {/* Checkbox */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateTodo(todo.id, { completed: !todo.completed });
                  }}
                  className="flex-shrink-0 mt-0.5"
                >
                  {todo.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                  )}
                </motion.button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`
                    text-sm dark:text-gray-200
                    ${todo.completed ? 'line-through text-gray-500 dark:text-gray-500' : ''}
                  `}>
                    {todo.title}
                  </p>
                  
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    {/* Priority Badge */}
                    <span className={`
                      text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1
                      ${getPriorityBg(todo.priority)} ${getPriorityColor(todo.priority)}
                    `}>
                      {todo.priority === 'high' ? '🔴' : todo.priority === 'medium' ? '🟡' : '🟢'}
                      <span className="capitalize">{todo.priority === 'high' ? 'Важно' : todo.priority === 'medium' ? 'Средне' : 'Низко'}</span>
                    </span>

                    {/* Tags */}
                    {todo.tags && todo.tags.length > 0 && (
                      <>
                        {todo.tags.slice(0, 2).map(tag => {
                          const defaultTag = DEFAULT_TAGS.find(t => t.name === tag);
                          return (
                            <span 
                              key={tag} 
                              className="text-[10px] px-2.5 py-1 rounded-full backdrop-blur-sm"
                              style={{ 
                                backgroundColor: defaultTag ? defaultTag.color + '30' : '#6b728030',
                                color: defaultTag ? defaultTag.color : '#6b7280'
                              }}
                            >
                              {defaultTag?.icon} {tag}
                            </span>
                          );
                        })}
                        {todo.tags.length > 2 && (
                          <span className="text-[10px] text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                            +{todo.tags.length - 2}
                          </span>
                        )}
                      </>
                    )}

                    {/* Due Date */}
                    {todo.dueDate && (
                      <span className={`
                        text-[10px] flex items-center gap-1 px-2.5 py-1 rounded-full
                        ${isOverdue(todo) 
                          ? 'text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/30' 
                          : 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800'
                        }
                      `}>
                        {isOverdue(todo) && <AlertCircle className="w-2.5 h-2.5" />}
                        <CalendarIcon className="w-2.5 h-2.5" />
                        {new Date(todo.dueDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                      </span>
                    )}
                  </div>
                </div>

                {/* Delete Button */}
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTodo(todo.id);
                  }}
                  className="flex-shrink-0 p-2 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-2xl transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                </motion.button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Enhanced Progress Bar */}
      {todos.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0"
        >
          <div className="flex items-center justify-between text-sm mb-3">
            <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Прогресс выполнения
            </span>
            <span className="dark:text-white">
              {Math.round(completionPercentage)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 h-2.5 rounded-full relative overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          </div>
          
          {/* Motivational Message */}
          {completionPercentage === 100 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-3 text-center"
            >
              <p className="text-sm text-emerald-600 dark:text-emerald-400">
                🎉 Отличная работа! Все задачи выполнены!
              </p>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Todo Modal */}
      {showTodoModal && (
        <TodoModal
          todo={selectedTodo}
          onClose={() => {
            setShowTodoModal(false);
            setSelectedTodo(null);
          }}
          onSave={(todo) => {
            if (selectedTodo) {
              onUpdateTodo(selectedTodo.id, todo);
            } else {
              onAddTodo(todo);
            }
            setShowTodoModal(false);
            setSelectedTodo(null);
          }}
          onDelete={selectedTodo ? () => {
            onDeleteTodo(selectedTodo.id);
            setShowTodoModal(false);
            setSelectedTodo(null);
          } : undefined}
          theme={theme}
          allTags={allTags}
          onAddCustomTag={onAddCustomTag}
        />
      )}
    </motion.div>
  );
}
