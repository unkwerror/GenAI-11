import { CalendarEvent, Theme } from '../App';
import { Clock } from 'lucide-react';

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent, e: React.MouseEvent) => void;
  onTimeSlotClick: (date: Date) => void;
  theme: Theme;
}

export function WeekView({ currentDate, events, onEventClick, onTimeSlotClick, theme }: WeekViewProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Get the week days starting from Monday
  const getWeekDays = () => {
    const days = [];
    const current = new Date(currentDate);
    
    // Get Monday of current week
    const day = current.getDay();
    const diff = current.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(current.setDate(diff));

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      days.push(date);
    }

    return days;
  };

  const weekDays = getWeekDays();
  const weekDayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const getEventsForDayAndHour = (date: Date, hour: number) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      const eventStartHour = parseInt(event.startTime.split(':')[0]);
      
      return eventDate.getDate() === date.getDate() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getFullYear() === date.getFullYear() &&
             eventStartHour === hour;
    });
  };

  const formatHour = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const calculateEventHeight = (event: CalendarEvent) => {
    const [startHour, startMinute] = event.startTime.split(':').map(Number);
    const [endHour, endMinute] = event.endTime.split(':').map(Number);
    
    const startInMinutes = startHour * 60 + startMinute;
    const endInMinutes = endHour * 60 + endMinute;
    const durationInMinutes = endInMinutes - startInMinutes;
    
    return (durationInMinutes / 60) * 50; // 50px per hour
  };

  const calculateEventPosition = (event: CalendarEvent) => {
    const [startHour, startMinute] = event.startTime.split(':').map(Number);
    return (startMinute / 60) * 50;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Week Header */}
      <div className="grid grid-cols-8 gap-1 mb-2 flex-shrink-0">
        <div className="w-16"></div>
        {weekDays.map((day, index) => (
          <div
            key={index}
            className={`
              text-center p-2 rounded-lg text-xs
              ${isToday(day) 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-700'
              }
            `}
          >
            <p className={`text-[10px] ${isToday(day) ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`}>
              {weekDayNames[index]}
            </p>
            <p className={`${isToday(day) ? 'text-white' : 'dark:text-white'}`}>
              {day.getDate()}
            </p>
          </div>
        ))}
      </div>

      {/* Week Grid */}
      <div className="flex-1 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="relative">
          {hours.map(hour => (
            <div key={hour} className="flex border-b border-gray-100 dark:border-gray-700" style={{ height: '50px' }}>
              {/* Time Label */}
              <div className="w-16 flex-shrink-0 p-1 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-1 text-[10px] text-gray-600 dark:text-gray-400">
                  <Clock className="w-2 h-2" />
                  {formatHour(hour)}
                </div>
              </div>

              {/* Day Columns */}
              {weekDays.map((day, dayIndex) => {
                const dayEvents = getEventsForDayAndHour(day, hour);
                
                return (
                  <div
                    key={dayIndex}
                    onClick={() => {
                      const date = new Date(day);
                      date.setHours(hour, 0, 0, 0);
                      onTimeSlotClick(date);
                    }}
                    className={`
                      flex-1 border-r border-gray-100 dark:border-gray-700 cursor-pointer relative
                      hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors
                      ${isToday(day) ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}
                    `}
                  >
                    {dayEvents.map(event => (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event, e);
                        }}
                        className="absolute left-0.5 right-0.5 rounded text-[9px] hover:shadow-sm transition-shadow cursor-pointer overflow-hidden px-1"
                        style={{ 
                          backgroundColor: event.color + '30',
                          color: theme === 'dark' ? '#fff' : event.color,
                          borderLeft: `2px solid ${event.color}`,
                          top: `${calculateEventPosition(event)}px`,
                          height: `${calculateEventHeight(event)}px`,
                          zIndex: 10
                        }}
                        title={`${event.title} (${event.startTime} - ${event.endTime})`}
                      >
                        <div className="truncate">
                          <strong>{event.title}</strong>
                        </div>
                        <div className="text-[8px]">{event.startTime}</div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}