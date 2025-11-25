import { useState } from 'react';
import { X, Trash2, Calendar, Tag as TagIcon, Plus } from 'lucide-react';
import { TodoItem, Theme, DEFAULT_TAGS } from '../App';

interface TodoModalProps {
  todo?: TodoItem | null;
  onClose: () => void;
  onSave: (todo: Omit<TodoItem, 'id' | 'createdAt'>) => void;
  onDelete?: () => void;
  theme: Theme;
  allTags: string[];
  onAddCustomTag: (tag: string) => void;
}

export function TodoModal({ todo, onClose, onSave, onDelete, theme, allTags, onAddCustomTag }: TodoModalProps) {
  const [title, setTitle] = useState(todo?.title || '');
  const [dueDate, setDueDate] = useState(
    todo?.dueDate ? new Date(todo.dueDate).toISOString().split('T')[0] : ''
  );
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(todo?.priority || 'medium');
  const [category, setCategory] = useState<'day' | 'week' | 'general'>(todo?.category || 'general');
  const [selectedTags, setSelectedTags] = useState<string[]>(todo?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const todoData: Omit<TodoItem, 'id' | 'createdAt'> = {
      title,
      completed: todo?.completed || false,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      priority,
      category,
      tags: selectedTags
    };

    onSave(todoData);
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddCustomTag = () => {
    if (newTag.trim() && !allTags.includes(newTag.trim())) {
      onAddCustomTag(newTag.trim());
      setSelectedTags([...selectedTags, newTag.trim()]);
      setNewTag('');
      setShowTagInput(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="dark:text-white text-sm">{todo ? 'Редактировать задачу' : 'Новая задача'}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 dark:text-white" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {/* Title */}
          <div>
            <label className="block text-xs mb-1 dark:text-gray-300">
              Название задачи *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Купить подарок"
              required
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Priority & Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs mb-1 dark:text-gray-300">
                Приоритет
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">🟢 Низкий</option>
                <option value="medium">🟡 Средний</option>
                <option value="high">🔴 Высокий</option>
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1 dark:text-gray-300">
                Категория
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as 'day' | 'week' | 'general')}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="day">День</option>
                <option value="week">Неделя</option>
                <option value="general">Общее</option>
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs mb-1 dark:text-gray-300">
              <Calendar className="w-3 h-3 inline mr-1" />
              Срок выполнения
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs mb-2 dark:text-gray-300">
              <TagIcon className="w-3 h-3 inline mr-1" />
              Теги
            </label>
            <div className="flex flex-wrap gap-1.5">
              {DEFAULT_TAGS.map(tag => (
                <button
                  key={tag.name}
                  type="button"
                  onClick={() => toggleTag(tag.name)}
                  className={`
                    text-[10px] px-2 py-1 rounded-lg transition-all
                    ${selectedTags.includes(tag.name)
                      ? 'ring-2 ring-offset-1 dark:ring-offset-gray-800'
                      : 'hover:scale-105'
                    }
                  `}
                  style={{
                    backgroundColor: tag.color + (selectedTags.includes(tag.name) ? '' : '30'),
                    color: selectedTags.includes(tag.name) ? '#fff' : tag.color,
                    ringColor: tag.color
                  }}
                >
                  {tag.icon} {tag.name}
                </button>
              ))}
              
              {allTags.filter(t => !DEFAULT_TAGS.find(dt => dt.name === t)).map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`
                    text-[10px] px-2 py-1 rounded-lg transition-all
                    ${selectedTags.includes(tag)
                      ? 'bg-gray-600 text-white ring-2 ring-gray-400 ring-offset-1'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:scale-105'
                    }
                  `}
                >
                  {tag}
                </button>
              ))}

              {!showTagInput ? (
                <button
                  type="button"
                  onClick={() => setShowTagInput(true)}
                  className="text-[10px] px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Добавить
                </button>
              ) : (
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomTag())}
                    placeholder="Новый тег"
                    className="text-[10px] px-2 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomTag}
                    className="text-[10px] px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    ✓
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowTagInput(false);
                      setNewTag('');
                    }}
                    className="text-[10px] px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-3">
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="px-3 py-1.5 text-sm bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Удалить
              </button>
            )}
            <div className="flex-1" />
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 dark:text-white rounded-lg transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
            >
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
