import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, KeyRound, Save, AlertCircle, Clock, Bell } from 'lucide-react';

export default function EmployeeProfile() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [profile, setProfile] = useState<{
    email: string;
    pin: string;
    fiscal_name: string;
    document_type: string;
    document_number: string;
    delegation: string;
    employee_id: string;
    work_centers: string[];
    job_positions: string[];
    seniority_date: string;
    work_schedule: { 
      [key: string]: { 
        morning_shift?: { start_time: string, end_time: string },
        afternoon_shift?: { start_time: string, end_time: string }
      } | null 
    };
    notification_minutes: number;
  } | null>(null);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [workSchedule, setWorkSchedule] = useState<{ 
    [key: string]: { 
      morning_shift?: { start_time: string, end_time: string },
      afternoon_shift?: { start_time: string, end_time: string }
    } | null 
  }>({});
  const [notificationMinutes, setNotificationMinutes] = useState<number>(0);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const employeeId = localStorage.getItem('employeeId');
      if (!employeeId) {
        throw new Error('No se encontró el ID del empleado');
      }

      const { data: profile, error } = await supabase
        .from('employee_profiles')
        .select('*')
        .eq('id', employeeId)
        .single();

      if (error) throw error;
      setProfile(profile);
      setWorkSchedule(profile.work_schedule || {});
      setNotificationMinutes(profile.notification_minutes || 0);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Error al cargar el perfil');
    }
  };

  const handleUpdatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (newPin.length !== 6 || !/^\d+$/.test(newPin)) {
        throw new Error('El PIN debe ser de 6 dígitos numéricos');
      }

      if (newPin !== confirmPin) {
        throw new Error('Los PINs no coinciden');
      }

      const employeeId = localStorage.getItem('employeeId');
      if (!employeeId) {
        throw new Error('No se encontró el ID del empleado');
      }

      const { error: updateError } = await supabase
        .rpc('update_employee_pin', {
          p_employee_id: employeeId,
          p_new_pin: newPin
        });

      if (updateError) throw updateError;

      setSuccess(true);
      setNewPin('');
      setConfirmPin('');
      await fetchProfile();
    } catch (err) {
      console.error('Error updating PIN:', err);
      setError(err instanceof Error ? err.message : 'Error al actualizar el PIN');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWorkSchedule = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const employeeId = localStorage.getItem('employeeId');
      if (!employeeId) {
        throw new Error('No se encontró el ID del empleado');
      }

      const { error } = await supabase
        .from('employee_profiles')
        .update({ work_schedule: workSchedule, notification_minutes: notificationMinutes })
        .eq('id', employeeId);

      if (error) throw error;

      setSuccess(true);
      await fetchProfile();
    } catch (err) {
      console.error('Error saving work schedule:', err);
      setError(err instanceof Error ? err.message : 'Error al guardar el horario laboral');
    } finally {
      setLoading(false);
    }
  };

  const handleWorkScheduleChange = (day: string, shift: 'morning_shift' | 'afternoon_shift', field: 'start_time' | 'end_time', value: string) => {
    setWorkSchedule(prev => {
      const daySchedule = prev[day] || {};
      const shiftSchedule = daySchedule?.[shift] || { start_time: '', end_time: '' };
      
      return {
        ...prev,
        [day]: {
          ...daySchedule,
          [shift]: {
            ...shiftSchedule,
            [field]: value
          }
        }
      };
    });
  };

  const handleNotificationMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      setNotificationMinutes(value);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Mi Perfil</h2>

        {/* Información del perfil */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Nombre</h3>
              </div>
              <p className="text-gray-700">{profile?.fiscal_name}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Correo Electrónico</h3>
              </div>
              <p className="text-gray-700">{profile?.email}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Tipo Documento</h3>
              </div>
              <p className="text-gray-700">{profile?.document_type}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Número Documento</h3>
              </div>
              <p className="text-gray-700">{profile?.document_number}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Delegación</h3>
              </div>
              <p className="text-gray-700">{profile?.delegation}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">ID</h3>
              </div>
              <p className="text-gray-700">{profile?.employee_id}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Centros de Trabajo</h3>
              </div>
              <p className="text-gray-700">{profile?.work_centers?.join(', ')}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Puestos de Trabajo</h3>
              </div>
              <p className="text-gray-700">{profile?.job_positions?.join(', ')}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Antigüedad</h3>
              </div>
              <p className="text-gray-700">{profile?.seniority_date}</p>
            </div>
          </div>
        </div>

        {/* Formulario para cambiar PIN */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Cambiar PIN</h3>
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
              PIN actualizado correctamente
            </div>
          )}

          <form onSubmit={handleUpdatePin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nuevo PIN
              </label>
              <input
                type="password"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                maxLength={6}
                pattern="\d{6}"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ingresa 6 dígitos"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Nuevo PIN
              </label>
              <input
                type="password"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                maxLength={6}
                pattern="\d{6}"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Confirma los 6 dígitos"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Actualizando...' : 'Actualizar PIN'}
            </button>
          </form>
        </div>

        {/* Configuración de Horario Laboral */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Horario Laboral
          </h3>

          {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(day => (
            <div key={day} className="mb-6">
              <h4 className="text-lg font-medium mb-2">{day}</h4>
              
              <div className="space-y-4">
                {/* Turno Día */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h5 className="font-medium text-blue-800 mb-2">Turno Día</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Entrada</label>
                      <input
                        type="time"
                        value={workSchedule[day]?.morning_shift?.start_time || ''}
                        onChange={(e) => handleWorkScheduleChange(day, 'morning_shift', 'start_time', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Salida</label>
                      <input
                        type="time"
                        value={workSchedule[day]?.morning_shift?.end_time || ''}
                        onChange={(e) => handleWorkScheduleChange(day, 'morning_shift', 'end_time', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Turno Tarde */}
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h5 className="font-medium text-orange-800 mb-2">Turno Tarde</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Entrada</label>
                      <input
                        type="time"
                        value={workSchedule[day]?.afternoon_shift?.start_time || ''}
                        onChange={(e) => handleWorkScheduleChange(day, 'afternoon_shift', 'start_time', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Salida</label>
                      <input
                        type="time"
                        value={workSchedule[day]?.afternoon_shift?.end_time || ''}
                        onChange={(e) => handleWorkScheduleChange(day, 'afternoon_shift', 'end_time', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setWorkSchedule(prev => ({ ...prev, [day]: null }))}
                className="mt-2 w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
              >
                No Trabaja este día
              </button>
            </div>
          ))}

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              Notificación App (minutos)
            </label>
            <input
              type="number"
              value={notificationMinutes}
              onChange={handleNotificationMinutesChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ingresa los minutos"
            />
            <p className="text-sm text-gray-500 mt-1">
              Se enviará una notificación {notificationMinutes} minutos después de esta hora si no se ha registrado ningún fichaje.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSaveWorkSchedule}
            disabled={loading}
            className="mt-4 flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Guardando...' : 'Guardar Horario y Notificación'}
          </button>
        </div>
      </div>
    </div>
  );
}
