import { CalendarEvent, Theme } from '../App';
import { Clock } from 'lucide-react';

interface DayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent, e: React.MouseEvent) => void;
  onTimeSlotClick: (date: Date) => void;
  theme: Theme;
}

export function DayView({ currentDate, events, onEventClick, onTimeSlotClick, theme }: DayViewProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getEventsForHour = (hour: number) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      const eventStartHour = parseInt(event.startTime.split(':')[0]);
      const eventEndHour = parseInt(event.endTime.split(':')[0]);
      const eventEndMinute = parseInt(event.endTime.split(':')[1]);
      
      const endHourActual = eventEndMinute > 0 ? eventEndHour + 1 : eventEndHour;
      
      return eventDate.getDate() === currentDate.getDate() &&
             eventDate.getMonth() === currentDate.getMonth() &&
             eventDate.getFullYear() === currentDate.getFullYear() &&
             hour >= eventStartHour && hour < endHourActual;
    });
  };

  const formatHour = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  const calculateEventHeight = (event: CalendarEvent) => {
    const [startHour, startMinute] = event.startTime.split(':').map(Number);
    const [endHour, endMinute] = event.endTime.split(':').map(Number);
    
    const startInMinutes = startHour * 60 + startMinute;
    const endInMinutes = endHour * 60 + endMinute;
    const durationInMinutes = endInMinutes - startInMinutes;
    
    return (durationInMinutes / 60) * 60; // 60px per hour
  };

  const calculateEventPosition = (event: CalendarEvent) => {
    const [startHour, startMinute] = event.startTime.split(':').map(Number);
    return (startMinute / 60) * 60; // Position within the hour
  };

  const getEventForSlot = (hour: number) => {
    const event = events.find(event => {
      const eventDate = new Date(event.date);
      const eventStartHour = parseInt(event.startTime.split(':')[0]);
      
      return eventDate.getDate() === currentDate.getDate() &&
             eventDate.getMonth() === currentDate.getMonth() &&
             eventDate.getFullYear() === currentDate.getFullYear() &&
             eventStartHour === hour;
    });
    
    return event;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Time Slots */}
      <div className="flex-1 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="relative">
          {hours.map(hour => {
            const eventInSlot = getEventForSlot(hour);
            
            return (
              <div
                key={hour}
                onClick={() => {
                  const date = new Date(currentDate);
                  date.setHours(hour, 0, 0, 0);
                  onTimeSlotClick(date);
                }}
                className="flex border-b border-gray-100 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors cursor-pointer relative"
                style={{ height: '60px' }}
              >
                {/* Time Label */}
                <div className="w-16 flex-shrink-0 p-2 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                    <Clock className="w-3 h-3" />
                    {formatHour(hour)}
                  </div>
                </div>

                {/* Events Container */}
                <div className="flex-1 relative">
                  {eventInSlot && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(eventInSlot, e);
                      }}
                      className="absolute left-1 right-1 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer border-l-4 p-2 overflow-hidden"
                      style={{ 
                        backgroundColor: eventInSlot.color + '25',
                        borderLeftColor: eventInSlot.color,
                        top: `${calculateEventPosition(eventInSlot)}px`,
                        height: `${calculateEventHeight(eventInSlot)}px`,
                        zIndex: 10
                      }}
                    >
                      <div className="flex flex-col h-full">
                        <p className="text-xs dark:text-white truncate" style={{ color: theme === 'dark' ? '#fff' : eventInSlot.color }}>
                          <strong>{eventInSlot.title}</strong>
                        </p>
                        <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5">
                          {eventInSlot.startTime} - {eventInSlot.endTime}
                        </p>
                        {eventInSlot.tags && eventInSlot.tags.length > 0 && (
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {eventInSlot.tags.slice(0, 2).map(tag => (
                              <span 
                                key={tag} 
                                className="text-[9px] px-1 py-0.5 bg-white dark:bg-gray-800 rounded"
                                style={{ color: eventInSlot.color }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}