import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarEvent {
  title: string;
  start: string; // Incluye fecha y hora
  end: string;   // Incluye fecha y hora
  color: string;
  type: 'planner' | 'holiday';
  details?: {
    planner_type?: string;
    comment?: string;
    status?: string;
  };
}

export default function EmployeeCalendar() {
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showPlannerRequests, setShowPlannerRequests] = useState(true);
  const [showHolidays, setShowHolidays] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCalendarEvents();
  }, [currentDate, showPlannerRequests, showHolidays]);

  const fetchCalendarEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const employeeId = localStorage.getItem('employeeId');
      if (!employeeId) {
        throw new Error('No se encontró el ID del empleado');
      }

      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      startOfMonth.setHours(0, 0, 0, 0);
      endOfMonth.setHours(23, 59, 59, 999);

      // Obtener los centros de trabajo del empleado
      const { data: employeeData, error: employeeError } = await supabase
        .from('employee_profiles')
        .select('work_centers')
        .eq('id', employeeId)
        .single();

      if (employeeError) throw employeeError;

      // Obtener solicitudes de planificador
      const { data: plannerData, error: plannerError } = await supabase
        .from('planner_requests')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('status', 'approved')
        .or(`start_date.lte.${endOfMonth.toISOString()},end_date.gte.${startOfMonth.toISOString()}`);

      if (plannerError) throw plannerError;

      // Obtener festivos
      const { data: holidaysData, error: holidaysError } = await supabase
        .from('holidays')
        .select('*')
        .gte('date', startOfMonth.toISOString())
        .lte('date', endOfMonth.toISOString())
        .or(`work_center.is.null,work_center.in.(${employeeData.work_centers.map(wc => `"${wc}"`).join(',')})`);

      if (holidaysError) throw holidaysError;

      // Procesar solicitudes de planificador
      const events: CalendarEvent[] = [];

      if (showPlannerRequests) {
        (plannerData || []).forEach(p => {
          const start = new Date(p.start_date); // Usar la fecha y hora de start_date
          const end = new Date(p.end_date);    // Usar la fecha y hora de end_date

          let current = new Date(start);

          while (current <= end) {
            if (current >= startOfMonth && current <= endOfMonth) {
              const isFirstDay = current.toDateString() === start.toDateString();
              const isLastDay = current.toDateString() === end.toDateString();

              events.push({
                title: `${p.planner_type}`,
                start: isFirstDay ? start.toISOString() : new Date(current.setHours(0, 0, 0, 0)).toISOString(), // Solo la hora en el primer día
                end: isLastDay ? end.toISOString() : new Date(current.setHours(23, 59, 59, 999)).toISOString(),   // Solo la hora en el último día
                color: '#22c55e',
                type: 'planner',
                details: {
                  planner_type: p.planner_type,
                  comment: p.comment,
                  status: p.status
                }
              });
            }
            current.setDate(current.getDate() + 1);
          }
        });
      }

      // Procesar festivos
      if (showHolidays) {
        (holidaysData || []).forEach(h => {
          events.push({
            title: h.name + (h.work_center ? ` (${h.work_center})` : ' (Todos los centros)'),
            start: h.date,
            end: h.date,
            color: '#f97316',
            type: 'holiday'
          });
        });
      }

      setCalendarEvents(events);
    } catch (err) {
      console.error('Error fetching calendar events:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar los eventos');
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Añadir días vacíos para alinear el calendario
    const firstDayOfWeek = firstDay.getDay();
    for (let i = 0; i < (firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1); i++) {
      days.push(null);
    }

    // Añadir días del mes
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(date => {
      const newDate = new Date(date);
      if (direction === 'prev') {
        newDate.setMonth(date.getMonth() - 1);
      } else {
        newDate.setMonth(date.getMonth() + 1);
      }
      return newDate;
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Mi Calendario</h2>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
            {error}
          </div>
        )}

        {/* Leyenda */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => setShowPlannerRequests(!showPlannerRequests)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              showPlannerRequests ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span className="text-sm">Planificador</span>
          </button>

          <button
            onClick={() => setShowHolidays(!showHolidays)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              showHolidays ? 'bg-orange-50 text-orange-600' : 'bg-gray-50 text-gray-600'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-sm">Festivos</span>
          </button>
        </div>

        {/* Navegación del mes */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-semibold">
            {currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
          </h2>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Cuadrícula del calendario */}
        <div className="grid grid-cols-7 gap-2">
          {/* Encabezado del calendario */}
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
            <div key={day} className="text-center font-semibold py-2">
              {day}
            </div>
          ))}
          {/* Días del calendario */}
          {loading ? (
            <div className="col-span-7 py-20 text-center text-gray-500">
              Cargando eventos...
            </div>
          ) : (
            getDaysInMonth(currentDate).map((date, index) => (
              <div
                key={index}
                className={`min-h-[100px] p-2 border rounded-lg ${
                  date ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                {date && (
                  <>
                    <div className="font-medium mb-1">
                      {date.getDate()}
                    </div>
                    <div className="space-y-1 overflow-auto">
                      {calendarEvents
                        .filter(event => {
                          const eventDate = new Date(event.start);
                          return (
                            eventDate.getDate() === date.getDate() &&
                            eventDate.getMonth() === date.getMonth() &&
                            eventDate.getFullYear() === date.getFullYear()
                          );
                        })
                        .map((event, eventIndex) => (
                          <div
                            key={eventIndex}
                            className="text-xs p-2 rounded whitespace-nowrap overflow-visible"
                            style={{ 
                              backgroundColor: `${event.color}15`,
                              borderLeft: `3px solid ${event.color}`,
                              color: event.color 
                            }}
                          >
                            {event.type === 'planner' ? (
                              <>
                                {event.title}{' '}
                                {new Date(event.start).toDateString() === date.toDateString() && (
                                  `(${new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`
                                )}
                                {new Date(event.end).toDateString() === date.toDateString() && (
                                  `(${new Date(event.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`
                                )}
                              </>
                            ) : (
                              event.title
                            )}
                          </div>
                        ))}
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}