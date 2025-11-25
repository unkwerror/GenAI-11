import { X, Sun, Moon, Palette, Check, Calendar, Globe, Bell, Clock, Zap } from 'lucide-react';
import { Theme } from '../App';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SettingsPanelProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  integrations: {
    google: { connected: boolean; email: string };
    yandex: { connected: boolean; email: string };
  };
  setIntegrations: (integrations: { google: { connected: boolean; email: string }; yandex: { connected: boolean; email: string } }) => void;
  onClose: () => void;
}

export function SettingsPanel({ theme, setTheme, integrations, setIntegrations, onClose }: SettingsPanelProps) {
  const [activeSection, setActiveSection] = useState<'theme' | 'calendar' | 'integrations'>('theme');
  const [calendarSettings, setCalendarSettings] = useState({
    defaultView: 'day',
    weekStartsOn: 'monday',
    showWeekNumbers: false,
    defaultEventDuration: 60,
    defaultReminderTime: 15,
    timeFormat: '24h' as '12h' | '24h',
    firstDayOfWeek: 1
  });

  const handleGoogleConnect = () => {
    if (integrations.google.connected) {
      setIntegrations({
        ...integrations,
        google: { connected: false, email: '' }
      });
    } else {
      const email = prompt('Введите ваш Google email:');
      if (email) {
        setIntegrations({
          ...integrations,
          google: { connected: true, email }
        });
      }
    }
  };

  const handleYandexConnect = () => {
    if (integrations.yandex.connected) {
      setIntegrations({
        ...integrations,
        yandex: { connected: false, email: '' }
      });
    } else {
      const email = prompt('Введите ваш Яндекс email:');
      if (email) {
        setIntegrations({
          ...integrations,
          yandex: { connected: true, email }
        });
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white dark:bg-gray-800 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="dark:text-white">Настройки</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Кастомизация и настройка приложения
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl transition-all"
          >
            <X className="w-5 h-5 dark:text-white" />
          </motion.button>
        </div>

        {/* Section Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 px-6">
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveSection('theme')}
            className={`
              px-4 py-3 text-sm transition-all relative rounded-t-2xl flex items-center gap-2
              ${activeSection === 'theme'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }
            `}
          >
            <Palette className="w-4 h-4" />
            Тема
            {activeSection === 'theme' && (
              <motion.div 
                layoutId="activeSection"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" 
              />
            )}
          </motion.button>
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveSection('calendar')}
            className={`
              px-4 py-3 text-sm transition-all relative rounded-t-2xl flex items-center gap-2
              ${activeSection === 'calendar'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }
            `}
          >
            <Calendar className="w-4 h-4" />
            Календарь
            {activeSection === 'calendar' && (
              <motion.div 
                layoutId="activeSection"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" 
              />
            )}
          </motion.button>
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveSection('integrations')}
            className={`
              px-4 py-3 text-sm transition-all relative rounded-t-2xl flex items-center gap-2
              ${activeSection === 'integrations'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }
            `}
          >
            <Globe className="w-4 h-4" />
            Интеграции
            {activeSection === 'integrations' && (
              <motion.div 
                layoutId="activeSection"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" 
              />
            )}
          </motion.button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {/* Theme Section */}
            {activeSection === 'theme' && (
              <motion.div
                key="theme"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <h4 className="mb-4 dark:text-white flex items-center gap-2">
                    <Palette className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Тема оформления
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* Light Theme */}
                    <button
                      onClick={() => setTheme('light')}
                      className={`
                        relative border-2 rounded-2xl p-6 transition-all hover:scale-105
                        ${theme === 'light' 
                          ? 'border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 shadow-lg' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }
                      `}
                    >
                      {theme === 'light' && (
                        <div className="absolute top-3 right-3 bg-blue-600 dark:bg-blue-400 rounded-full p-1">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                      
                      <div className="flex flex-col items-center gap-3">
                        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-4 rounded-3xl">
                          <Sun className="w-8 h-8 text-white" />
                        </div>
                        <div className="text-center">
                          <p className="dark:text-white">Светлая тема</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            Классический светлый дизайн
                          </p>
                        </div>
                      </div>

                      {/* Preview */}
                      <div className="mt-4 bg-white border border-gray-200 rounded-2xl p-3 space-y-2">
                        <div className="h-2 bg-blue-500 rounded-full w-3/4"></div>
                        <div className="h-2 bg-gray-300 rounded-full w-1/2"></div>
                        <div className="h-2 bg-gray-300 rounded-full w-2/3"></div>
                      </div>
                    </button>

                    {/* Dark Theme */}
                    <button
                      onClick={() => setTheme('dark')}
                      className={`
                        relative border-2 rounded-2xl p-6 transition-all hover:scale-105
                        ${theme === 'dark' 
                          ? 'border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 shadow-lg' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }
                      `}
                    >
                      {theme === 'dark' && (
                        <div className="absolute top-3 right-3 bg-blue-600 dark:bg-blue-400 rounded-full p-1">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                      
                      <div className="flex flex-col items-center gap-3">
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-4 rounded-3xl">
                          <Moon className="w-8 h-8 text-white" />
                        </div>
                        <div className="text-center">
                          <p className="dark:text-white">Темная тема</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            Удобно для работы ночью
                          </p>
                        </div>
                      </div>

                      {/* Preview */}
                      <div className="mt-4 bg-gray-900 border border-gray-700 rounded-2xl p-3 space-y-2">
                        <div className="h-2 bg-blue-400 rounded-full w-3/4"></div>
                        <div className="h-2 bg-gray-600 rounded-full w-1/2"></div>
                        <div className="h-2 bg-gray-600 rounded-full w-2/3"></div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Info Card */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4">
                  <p className="text-sm text-blue-900 dark:text-blue-300">
                    💡 <strong>Совет:</strong> Темная тема помогает снизить нагрузку на глаза при работе в темное время суток и экономит заряд батареи на устройствах с OLED-экранами.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Calendar Section */}
            {activeSection === 'calendar' && (
              <motion.div
                key="calendar"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <h4 className="mb-4 dark:text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Настройки календаря
                  </h4>

                  <div className="space-y-4">
                    {/* Default View */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4">
                      <label className="block text-sm dark:text-white mb-2">
                        Вид календаря по умолчанию
                      </label>
                      <select
                        value={calendarSettings.defaultView}
                        onChange={(e) => setCalendarSettings({...calendarSettings, defaultView: e.target.value})}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="day">День</option>
                        <option value="week">Неделя</option>
                        <option value="month">Месяц</option>
                      </select>
                    </div>

                    {/* Week Starts On */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4">
                      <label className="block text-sm dark:text-white mb-2">
                        Начало недели
                      </label>
                      <select
                        value={calendarSettings.weekStartsOn}
                        onChange={(e) => setCalendarSettings({...calendarSettings, weekStartsOn: e.target.value})}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="monday">Понедельник</option>
                        <option value="sunday">Воскресенье</option>
                      </select>
                    </div>

                    {/* Time Format */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4">
                      <label className="flex items-center justify-between">
                        <span className="text-sm dark:text-white flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          Формат времени
                        </span>
                        <select
                          value={calendarSettings.timeFormat}
                          onChange={(e) => setCalendarSettings({...calendarSettings, timeFormat: e.target.value as '12h' | '24h'})}
                          className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="24h">24 часа</option>
                          <option value="12h">12 часов (AM/PM)</option>
                        </select>
                      </label>
                    </div>

                    {/* Default Event Duration */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4">
                      <label className="block text-sm dark:text-white mb-2 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        Длительность события по умолчанию (минут)
                      </label>
                      <input
                        type="number"
                        min="15"
                        step="15"
                        value={calendarSettings.defaultEventDuration}
                        onChange={(e) => setCalendarSettings({...calendarSettings, defaultEventDuration: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Default Reminder Time */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4">
                      <label className="block text-sm dark:text-white mb-2 flex items-center gap-2">
                        <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        Время напоминания по умолчанию (минут до события)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="5"
                        value={calendarSettings.defaultReminderTime}
                        onChange={(e) => setCalendarSettings({...calendarSettings, defaultReminderTime: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Show Week Numbers */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4">
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-sm dark:text-white">Показывать номера недель</span>
                        <input
                          type="checkbox"
                          checked={calendarSettings.showWeekNumbers}
                          onChange={(e) => setCalendarSettings({...calendarSettings, showWeekNumbers: e.target.checked})}
                          className="w-5 h-5 text-blue-600 rounded-full focus:ring-2 focus:ring-blue-500"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Integrations Section */}
            {activeSection === 'integrations' && (
              <motion.div
                key="integrations"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <h4 className="mb-4 dark:text-white flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Интеграции с календарями
                  </h4>

                  <div className="space-y-4">
                    {/* Google Calendar */}
                    <div className={`
                      border-2 rounded-2xl p-6 transition-all
                      ${integrations.google.connected 
                        ? 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20' 
                        : 'border-gray-200 dark:border-gray-700'
                      }
                    `}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="bg-gradient-to-br from-blue-600 to-blue-500 p-3 rounded-2xl">
                              <Calendar className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h5 className="dark:text-white">Google Calendar</h5>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {integrations.google.connected 
                                  ? `Подключен: ${integrations.google.email}` 
                                  : 'Синхронизация с Google Календарем'
                                }
                              </p>
                            </div>
                          </div>
                          
                          {integrations.google.connected && (
                            <div className="mt-3 flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                              <Check className="w-4 h-4" />
                              <span>Активна двусторонняя синхронизация</span>
                            </div>
                          )}
                        </div>
                        
                        <button
                          onClick={handleGoogleConnect}
                          className={`
                            px-4 py-2 rounded-2xl text-sm transition-all hover:scale-105
                            ${integrations.google.connected
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                            }
                          `}
                        >
                          {integrations.google.connected ? 'Отключить' : 'Подключить'}
                        </button>
                      </div>
                    </div>

                    {/* Yandex Calendar */}
                    <div className={`
                      border-2 rounded-2xl p-6 transition-all
                      ${integrations.yandex.connected 
                        ? 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20' 
                        : 'border-gray-200 dark:border-gray-700'
                      }
                    `}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="bg-gradient-to-br from-red-600 to-red-500 p-3 rounded-2xl">
                              <Calendar className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h5 className="dark:text-white">Яндекс Календарь</h5>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {integrations.yandex.connected 
                                  ? `Подключен: ${integrations.yandex.email}` 
                                  : 'Синхронизация с Яндекс Календарём'
                                }
                              </p>
                            </div>
                          </div>
                          
                          {integrations.yandex.connected && (
                            <div className="mt-3 flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                              <Check className="w-4 h-4" />
                              <span>Активна двусторонняя синхронизация</span>
                            </div>
                          )}
                        </div>
                        
                        <button
                          onClick={handleYandexConnect}
                          className={`
                            px-4 py-2 rounded-2xl text-sm transition-all hover:scale-105
                            ${integrations.yandex.connected
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
                              : 'bg-red-600 text-white hover:bg-red-700'
                            }
                          `}
                        >
                          {integrations.yandex.connected ? 'Отключить' : 'Подключить'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Info about integrations */}
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 mt-4">
                    <p className="text-sm text-amber-900 dark:text-amber-300">
                      🔒 <strong>Безопасность:</strong> Все данные синхронизируются в зашифрованном виде. Мы не храним ваши пароли и используем только официальные API сервисов.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:shadow-lg transition-all"
          >
            Сохранить
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}