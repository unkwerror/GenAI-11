import { CalendarEvent, Theme } from '../App';

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent, e: React.MouseEvent) => void;
  onDayClick: (date: Date) => void;
  theme: Theme;
}

export function MonthView({ currentDate, events, onEventClick, onDayClick, theme }: MonthViewProps) {
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

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="h-full flex flex-col">
      {/* Week Days */}
      <div className="grid grid-cols-7 gap-1 mb-1 flex-shrink-0">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs text-gray-600 dark:text-gray-400 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 flex-1">
        {days.map((dayInfo, index) => {
          const dayEvents = getEventsForDate(dayInfo.date);
          const isCurrentDay = isToday(dayInfo.date);

          return (
            <div
              key={index}
              onClick={() => dayInfo.isCurrentMonth && onDayClick(dayInfo.date)}
              className={`
                p-1 border rounded-lg cursor-pointer transition-all overflow-hidden flex flex-col
                ${dayInfo.isCurrentMonth 
                  ? 'bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-gray-600 border-gray-200 dark:border-gray-600' 
                  : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-400 dark:text-gray-600'
                }
                ${isCurrentDay ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}
              `}
            >
              <div className={`
                text-xs mb-1 dark:text-gray-300
                ${isCurrentDay ? 'bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]' : ''}
              `}>
                {dayInfo.day}
              </div>
              <div className="space-y-0.5 flex-1 overflow-hidden">
                {dayEvents.slice(0, 3).map(event => (
                  <div
                    key={event.id}
                    onClick={(e) => onEventClick(event, e)}
                    className="text-[10px] px-1 py-0.5 rounded truncate hover:shadow-sm transition-shadow"
                    style={{ backgroundColor: event.color + '20', color: event.color }}
                    title={`${event.title} (${event.startTime} - ${event.endTime})`}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-[10px] text-gray-500 dark:text-gray-400 px-1">
                    +{dayEvents.length - 3}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
