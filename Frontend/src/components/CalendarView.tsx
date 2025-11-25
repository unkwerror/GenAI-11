import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, List, Grid3x3 } from 'lucide-react';
import { CalendarEvent, ViewMode, Theme } from '../App';
import { EventModal } from './EventModal';
import { DayView } from './DayView';
import { WeekView } from './WeekView';
import { MonthView } from './MonthView';

interface CalendarViewProps {
  events: CalendarEvent[];
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  onDeleteEvent: (id: string) => void;
  onUpdateEvent: (id: string, event: Partial<CalendarEvent>) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  theme: Theme;
  allTags: string[];
  onAddCustomTag: (tag: string) => void;
}

export function CalendarView({ 
  events, 
  onAddEvent, 
  onDeleteEvent, 
  onUpdateEvent, 
  viewMode, 
  setViewMode, 
  theme,
  allTags,
  onAddCustomTag
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    let firstDayOfWeek = firstDay.getDay() - 1;
    if (firstDayOfWeek === -1) firstDayOfWeek = 6;

    const days = [];
    
    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthLastDay - i)
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i)
      });
    }

    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i)
      });
    }

    return days;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getDate() === date.getDate() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getFullYear() === date.getFullYear();
    });
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
    setShowEventModal(true);
  };

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setSelectedDate(null);
    setShowEventModal(true);
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (viewMode === 'day') {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
      setCurrentDate(newDate);
    } else if (viewMode === 'week') {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
      setCurrentDate(newDate);
    } else {
      const newDate = new Date(currentDate);
      newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
      setCurrentDate(newDate);
    }
  };

  const getDateDisplay = () => {
    if (viewMode === 'day') {
      return currentDate.toLocaleDateString('ru-RU', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric',
        weekday: 'long'
      });
    } else if (viewMode === 'week') {
      const startOfWeek = new Date(currentDate);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      return `${startOfWeek.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} - ${endOfWeek.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    } else {
      return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-4 h-full flex flex-col">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleNavigate('prev')}
            className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl transition-all hover:scale-105"
          >
            <ChevronLeft className="w-4 h-4 dark:text-white" />
          </button>
          <h3 className="dark:text-white min-w-[200px] text-center text-sm">
            {getDateDisplay()}
          </h3>
          <button
            onClick={() => handleNavigate('next')}
            className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl transition-all hover:scale-105"
          >
            <ChevronRight className="w-4 h-4 dark:text-white" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-2xl transition-all hover:scale-105 dark:text-white"
          >
            Сегодня
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-2xl p-1">
            <button
              onClick={() => setViewMode('day')}
              className={`
                flex items-center gap-1 px-3 py-1.5 rounded-2xl transition-all text-xs
                ${viewMode === 'day' 
                  ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400' 
                  : 'text-gray-600 dark:text-gray-400 hover:scale-105'
                }
              `}
            >
              <List className="w-3 h-3" />
              День
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`
                flex items-center gap-1 px-3 py-1.5 rounded-2xl transition-all text-xs
                ${viewMode === 'week' 
                  ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400' 
                  : 'text-gray-600 dark:text-gray-400 hover:scale-105'
                }
              `}
            >
              <Grid3x3 className="w-3 h-3" />
              Неделя
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`
                flex items-center gap-1 px-3 py-1.5 rounded-2xl transition-all text-xs
                ${viewMode === 'month' 
                  ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400' 
                  : 'text-gray-600 dark:text-gray-400 hover:scale-105'
                }
              `}
            >
              <CalendarIcon className="w-3 h-3" />
              Месяц
            </button>
          </div>

          <button
            onClick={() => {
              setSelectedDate(new Date());
              setSelectedEvent(null);
              setShowEventModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:shadow-lg transition-all hover:scale-105 text-sm"
          >
            <Plus className="w-3 h-3" />
            Добавить
          </button>
        </div>
      </div>

      {/* View Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'day' && (
          <DayView
            currentDate={currentDate}
            events={events}
            onEventClick={handleEventClick}
            onTimeSlotClick={handleDayClick}
            theme={theme}
          />
        )}

        {viewMode === 'week' && (
          <WeekView
            currentDate={currentDate}
            events={events}
            onEventClick={handleEventClick}
            onTimeSlotClick={handleDayClick}
            theme={theme}
          />
        )}

        {viewMode === 'month' && (
          <MonthView
            currentDate={currentDate}
            events={events}
            onEventClick={handleEventClick}
            onDayClick={handleDayClick}
            theme={theme}
          />
        )}
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <EventModal
          event={selectedEvent}
          initialDate={selectedDate}
          onClose={() => {
            setShowEventModal(false);
            setSelectedEvent(null);
            setSelectedDate(null);
          }}
          onSave={(event) => {
            if (selectedEvent) {
              onUpdateEvent(selectedEvent.id, event);
            } else {
              onAddEvent(event);
            }
            setShowEventModal(false);
            setSelectedEvent(null);
            setSelectedDate(null);
          }}
          onDelete={selectedEvent ? () => {
            onDeleteEvent(selectedEvent.id);
            setShowEventModal(false);
            setSelectedEvent(null);
          } : undefined}
          theme={theme}
          allTags={allTags}
          onAddCustomTag={onAddCustomTag}
        />
      )}
    </div>
  );
}