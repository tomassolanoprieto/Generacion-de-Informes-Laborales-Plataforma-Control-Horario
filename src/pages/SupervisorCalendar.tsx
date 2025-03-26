import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar, FileText, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';

interface CalendarEvent {
  title: string;
  start: string;
  end: string;
  color: string;
  type: 'planner' | 'holiday';
  details?: {
    employeeName?: string;
    plannerType?: string;
    hours?: number;
  };
}

interface NewHoliday {
  date: string;
  name: string;
  work_center: string | null;
}

interface NewPlanner {
  employeeId: string;
  plannerType: 'Horas compensadas' | 'Horas vacaciones' | 'Horas asuntos propios';
  startDate: string;
  endDate: string;
  comment: string;
}

export default function SupervisorCalendar() {
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showPlannerRequests, setShowPlannerRequests] = useState(true);
  const [showHolidays, setShowHolidays] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [selectedWorkCenter, setSelectedWorkCenter] = useState<string | null>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [workCenters, setWorkCenters] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHolidayForm, setShowHolidayForm] = useState(false);
  const [showPlannerForm, setShowPlannerForm] = useState(false);
  const [newHoliday, setNewHoliday] = useState<NewHoliday>({
    date: '',
    name: '',
    work_center: null,
  });
  const [newPlanner, setNewPlanner] = useState<NewPlanner>({
    employeeId: '',
    plannerType: 'Horas compensadas',
    startDate: '',
    endDate: '',
    comment: '',
  });

  // Get supervisor's work centers and employees
  useEffect(() => {
    const getSupervisorData = async () => {
      try {
        setLoading(true);
        setError(null);

        const supervisorEmail = localStorage.getItem('supervisorEmail');
        if (!supervisorEmail) {
          throw new Error('No se encontró el correo electrónico del supervisor');
        }

        const { data, error: rpcError } = await supabase.rpc('get_supervisor_calendar_data_v2', {
          p_supervisor_email: supervisorEmail
        });

        if (rpcError) throw rpcError;

        if (data && data.length > 0) {
          setWorkCenters(data[0].work_centers || []);
          setEmployees(data[0].employees || []);
        }
      } catch (err) {
        console.error('Error al obtener datos del supervisor:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    getSupervisorData();
  }, []);

  // Fetch calendar events when selection changes
  useEffect(() => {
    const fetchCalendarEvents = async () => {
      try {
        setLoading(true);
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        startOfMonth.setHours(0, 0, 0, 0);
        endOfMonth.setHours(23, 59, 59, 999);

        // Get planner requests
        let query = supabase
          .from('planner_requests')
          .select(`
            *,
            employee_profiles!inner (
              id,
              fiscal_name,
              work_centers
            )
          `)
          .eq('status', 'approved')
          .gte('start_date', startOfMonth.toISOString())
          .lte('end_date', endOfMonth.toISOString());

        if (selectedEmployee) {
          query = query.eq('employee_id', selectedEmployee);
        }

        if (selectedWorkCenter) {
          query = query.contains('employee_profiles.work_centers', [selectedWorkCenter]);
        }

        const [plannerResponse, holidaysResponse] = await Promise.all([
          query,
          supabase
            .from('holidays')
            .select('*')
            .gte('date', startOfMonth.toISOString())
            .lte('date', endOfMonth.toISOString())
            .or(`work_center.is.null,work_center.eq.${selectedWorkCenter}`)
        ]);

        if (plannerResponse.error) throw plannerResponse.error;
        if (holidaysResponse.error) throw holidaysResponse.error;

        const events: CalendarEvent[] = [];

        // Process planner requests
        if (showPlannerRequests) {
          (plannerResponse.data || []).forEach((p) => {
            const start = new Date(p.start_date);
            const end = new Date(p.end_date);
            let current = new Date(start);

            while (current <= end) {
              if (current >= startOfMonth && current <= endOfMonth) {
                events.push({
                  title: `${p.employee_profiles.fiscal_name} - ${p.planner_type}`,
                  start: current.toISOString(),
                  end: current.toISOString(),
                  color: '#22c55e',
                  type: 'planner',
                  details: {
                    employeeName: p.employee_profiles.fiscal_name,
                    plannerType: p.planner_type,
                    hours: 8
                  }
                });
              }
              current.setDate(current.getDate() + 1);
            }
          });
        }

        // Process holidays
        if (showHolidays) {
          (holidaysResponse.data || []).forEach((h) => {
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
        console.error('Error al obtener eventos del calendario:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar los eventos');
      } finally {
        setLoading(false);
      }
    };

    if (workCenters.length > 0) {
      fetchCalendarEvents();
    }
  }, [selectedEmployee, selectedWorkCenter, currentDate, showPlannerRequests, showHolidays, workCenters]);

  // Función para obtener los días del mes
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Agregar días vacíos para el padding
    const firstDayOfWeek = firstDay.getDay();
    for (let i = 0; i < (firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1); i++) {
      days.push(null);
    }

    // Agregar los días del mes
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  // Función para manejar la adición de un festivo
  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('holidays')
        .insert([newHoliday]);

      if (error) throw error;

      setShowHolidayForm(false);
      setNewHoliday({ date: '', name: '', work_center: null });
      // Refrescar los eventos del calendario
      setCurrentDate(new Date(currentDate));
    } catch (error) {
      console.error('Error al añadir festivo:', error);
    }
  };

  // Función para manejar la adición de un planificador
  const handleAddPlanner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('planner_requests')
        .insert([newPlanner]);

      if (error) throw error;

      setShowPlannerForm(false);
      setNewPlanner({
        employeeId: '',
        plannerType: 'Horas compensadas',
        startDate: '',
        endDate: '',
        comment: '',
      });
      // Refrescar los eventos del calendario
      setCurrentDate(new Date(currentDate));
    } catch (error) {
      console.error('Error al añadir planificador:', error);
    }
  };

  if (loading && !workCenters.length) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-8">
            <p>Cargando información del supervisor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Work Center Selection */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Centro de Trabajo</h2>
              <select
                value={selectedWorkCenter || ''}
                onChange={(e) => {
                  setSelectedWorkCenter(e.target.value || null);
                  setSelectedEmployee(null);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos los centros</option>
                {workCenters.map((center) => (
                  <option key={center} value={center}>
                    {center}
                  </option>
                ))}
              </select>
            </div>

            {/* Employee Selection */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Empleado</h2>
              <select
                value={selectedEmployee || ''}
                onChange={(e) => setSelectedEmployee(e.target.value || null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos los empleados</option>
                {employees
                  .filter(emp => !selectedWorkCenter || emp.work_centers.includes(selectedWorkCenter))
                  .map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fiscal_name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Filtros de Eventos */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Filtros</h2>
              <div className="space-y-4">
                <button
                  onClick={() => setShowPlannerRequests(!showPlannerRequests)}
                  className={`flex items-center gap-2 w-full px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors ${
                    showPlannerRequests ? 'bg-green-50' : ''
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  Planificador
                </button>
                <button
                  onClick={() => setShowHolidays(!showHolidays)}
                  className={`flex items-center gap-2 w-full px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors ${
                    showHolidays ? 'bg-orange-50' : ''
                  }`}
                >
                  <Calendar className="w-5 h-5" />
                  Festivos
                </button>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
              <h2 className="text-lg font-semibold mb-4">Acciones</h2>
              <button
                onClick={() => setShowPlannerForm(true)}
                className="flex items-center gap-2 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Añadir Planificador
              </button>
              <button
                onClick={() => setShowHolidayForm(true)}
                className="flex items-center gap-2 w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Añadir Festivo
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="lg:col-span-3">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => {
                    const newDate = new Date(currentDate);
                    newDate.setMonth(currentDate.getMonth() - 1);
                    setCurrentDate(newDate);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-semibold">
                  {currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
                </h2>
                <button
                  onClick={() => {
                    const newDate = new Date(currentDate);
                    newDate.setMonth(currentDate.getMonth() + 1);
                    setCurrentDate(newDate);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {/* Calendar Header */}
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
                  <div key={day} className="text-center font-semibold py-2">
                    {day}
                  </div>
                ))}
                {/* Calendar Days */}
                {getDaysInMonth(currentDate).map((date, index) => (
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
                        <div className="space-y-1">
                          {calendarEvents
                            .filter((event) => {
                              const eventDate = new Date(event.start);
                              const matchesDate = (
                                eventDate.getDate() === date.getDate() &&
                                eventDate.getMonth() === date.getMonth() &&
                                eventDate.getFullYear() === date.getFullYear()
                              );

                              if (!matchesDate) return false;
                              if (event.type === 'planner' && !showPlannerRequests) return false;
                              if (event.type === 'holiday' && !showHolidays) return false;

                              return true;
                            })
                            .map((event, eventIndex) => (
                              <div
                                key={eventIndex}
                                className="text-xs p-2 rounded"
                                style={{
                                  backgroundColor: `${event.color}15`,
                                  borderLeft: `3px solid ${event.color}`,
                                  color: event.color,
                                }}
                                title={event.details ? `${event.details.employeeName} - ${event.details.plannerType} (${event.details.hours}h)` : event.title}
                              >
                                {event.title}
                              </div>
                            ))}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forms */}
      {showHolidayForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Añadir Festivo</h2>
              <button
                onClick={() => setShowHolidayForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddHoliday} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha
                </label>
                <input
                  type="date"
                  value={newHoliday.date}
                  onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Festivo
                </label>
                <input
                  type="text"
                  value={newHoliday.name}
                  onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: Navidad"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Centro de Trabajo
                </label>
                <select
                  value={newHoliday.work_center || ''}
                  onChange={(e) => setNewHoliday({ ...newHoliday, work_center: e.target.value || null })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos los centros</option>
                  {workCenters.map((center) => (
                    <option key={center} value={center}>
                      {center}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowHolidayForm(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPlannerForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Añadir Planificador</h2>
              <button
                onClick={() => setShowPlannerForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddPlanner} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Empleado
                </label>
                <select
                  value={newPlanner.employeeId}
                  onChange={(e) => setNewPlanner({ ...newPlanner, employeeId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Seleccionar empleado</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fiscal_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Planificador
                </label>
                <select
                  value={newPlanner.plannerType}
                  onChange={(e) => setNewPlanner({ ...newPlanner, plannerType: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="Horas compensadas">Horas compensadas</option>
                  <option value="Horas vacaciones">Horas vacaciones</option>
                  <option value="Horas asuntos propios">Horas asuntos propios</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha y Hora de Inicio
                </label>
                <input
                  type="datetime-local"
                  value={newPlanner.startDate}
                  onChange={(e) => setNewPlanner({ ...newPlanner, startDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha y Hora de Fin
                </label>
                <input
                  type="datetime-local"
                  value={newPlanner.endDate}
                  onChange={(e) => setNewPlanner({ ...newPlanner, endDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comentario
                </label>
                <textarea
                  value={newPlanner.comment}
                  onChange={(e) => setNewPlanner({ ...newPlanner, comment: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  required
                />
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowPlannerForm(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}