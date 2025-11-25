import { useState, useEffect } from 'react';
import { X, Trash2, Calendar, Clock, Bell, Tag as TagIcon, Plus } from 'lucide-react';
import { CalendarEvent, Theme, DEFAULT_TAGS } from '../App';

interface EventModalProps {
  event?: CalendarEvent | null;
  initialDate?: Date | null;
  onClose: () => void;
  onSave: (event: Omit<CalendarEvent, 'id'>) => void;
  onDelete?: () => void;
  theme: Theme;
  allTags: string[];
  onAddCustomTag: (tag: string) => void;
}

export function EventModal({ event, initialDate, onClose, onSave, onDelete, theme, allTags, onAddCustomTag }: EventModalProps) {
  const [title, setTitle] = useState(event?.title || '');
  const [date, setDate] = useState(
    event?.date 
      ? new Date(event.date).toISOString().split('T')[0]
      : initialDate 
        ? initialDate.toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0]
  );
  const [startTime, setStartTime] = useState(event?.startTime || '10:00');
  const [endTime, setEndTime] = useState(event?.endTime || '11:00');
  const [description, setDescription] = useState(event?.description || '');
  const [color, setColor] = useState(event?.color || '#3b82f6');
  const [source, setSource] = useState<'local' | 'google' | 'yandex'>(event?.source || 'local');
  const [reminderEnabled, setReminderEnabled] = useState(event?.reminder?.enabled || false);
  const [reminderTime, setReminderTime] = useState(event?.reminder?.time || 15);
  const [reminderType, setReminderType] = useState<'notification' | 'email' | 'both'>(
    event?.reminder?.type || 'notification'
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(event?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);

  const colors = [
    { name: 'Синий', value: '#3b82f6' },
    { name: 'Зеленый', value: '#10b981' },
    { name: 'Красный', value: '#ef4444' },
    { name: 'Фиолетовый', value: '#8b5cf6' },
    { name: 'Желтый', value: '#f59e0b' },
    { name: 'Розовый', value: '#ec4899' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const eventData: Omit<CalendarEvent, 'id'> = {
      title,
      date: new Date(date),
      startTime,
      endTime,
      description,
      color,
      source,
      reminder: reminderEnabled ? {
        enabled: true,
        time: reminderTime,
        type: reminderType
      } : undefined,
      tags: selectedTags
    };

    onSave(eventData);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !allTags.includes(newTag.trim())) {
      onAddCustomTag(newTag.trim());
      setSelectedTags([...selectedTags, newTag.trim()]);
      setNewTag('');
      setShowTagInput(false);
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

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="dark:text-white">{event ? 'Редактировать событие' : 'Новое событие'}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 dark:text-white" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm mb-2 dark:text-gray-300">
              Название события *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Встреча с командой"
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm mb-2 dark:text-gray-300">
              <Calendar className="w-4 h-4 inline mr-1" />
              Дата *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2 dark:text-gray-300">
                <Clock className="w-4 h-4 inline mr-1" />
                Начало *
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm mb-2 dark:text-gray-300">
                Конец *
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm mb-2 dark:text-gray-300">
              Описание
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Добавьте описание события..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm mb-2 dark:text-gray-300">
              Цвет
            </label>
            <div className="flex gap-2 flex-wrap">
              {colors.map(c => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`
                    w-10 h-10 rounded-lg transition-all
                    ${color === c.value ? 'ring-2 ring-offset-2 dark:ring-offset-gray-800 ring-gray-400 scale-110' : 'hover:scale-105'}
                  `}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Source */}
          <div>
            <label className="block text-sm mb-2 dark:text-gray-300">
              Календарь
            </label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value as 'local' | 'google' | 'yandex')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="local">Локальный календарь</option>
              <option value="google">Google Calendar</option>
              <option value="yandex">Яндекс Календарь</option>
            </select>
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

          {/* Reminder Settings */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm dark:text-gray-300">
                <Bell className="w-4 h-4" />
                Напоминание
              </label>
              <button
                type="button"
                onClick={() => setReminderEnabled(!reminderEnabled)}
                className={`
                  relative w-12 h-6 rounded-full transition-colors
                  ${reminderEnabled 
                    ? 'bg-blue-600' 
                    : 'bg-gray-300 dark:bg-gray-600'
                  }
                `}
              >
                <div className={`
                  absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform
                  ${reminderEnabled ? 'translate-x-6' : ''}
                `} />
              </button>
            </div>

            {reminderEnabled && (
              <>
                <div>
                  <label className="block text-sm mb-2 dark:text-gray-300">
                    За сколько напомнить
                  </label>
                  <select
                    value={reminderTime}
                    onChange={(e) => setReminderTime(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={5}>За 5 минут</option>
                    <option value={10}>За 10 минут</option>
                    <option value={15}>За 15 минут</option>
                    <option value={30}>За 30 минут</option>
                    <option value={60}>За 1 час</option>
                    <option value={120}>За 2 часа</option>
                    <option value={1440}>За 1 день</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-2 dark:text-gray-300">
                    Способ напоминания
                  </label>
                  <select
                    value={reminderType}
                    onChange={(e) => setReminderType(e.target.value as 'notification' | 'email' | 'both')}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="notification">Уведомление</option>
                    <option value="email">Email</option>
                    <option value="both">Уведомление и Email</option>
                  </select>
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Удалить
              </button>
            )}
            <div className="flex-1" />
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 dark:text-white rounded-lg transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
            >
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}