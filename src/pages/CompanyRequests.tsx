import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Check, X, Search, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Request {
  request_id: string;
  request_type: 'time' | 'planner';
  request_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  employee_id: string;
  employee_name: string;
  employee_email: string;
  work_centers: string[];
  details: any;
}

function CompanyRequests() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedWorkCenter, setSelectedWorkCenter] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [workCenters, setWorkCenters] = useState<string[]>([]);

  useEffect(() => {
    fetchWorkCenters();
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [selectedWorkCenter, filter, startDate, endDate]);

  const fetchWorkCenters = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get all unique work centers from employee profiles
      const { data: employeeData, error: employeeError } = await supabase
        .from('employee_profiles')
        .select('work_centers')
        .eq('company_id', user.id);

      if (employeeError) throw employeeError;

      // Extract unique work centers
      const uniqueWorkCenters = new Set<string>();
      employeeData?.forEach(employee => {
        if (employee.work_centers) {
          employee.work_centers.forEach((center: string) => uniqueWorkCenters.add(center));
        }
      });

      setWorkCenters(Array.from(uniqueWorkCenters).sort());
    } catch (error) {
      console.error('Error fetching work centers:', error);
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);

      const { data: requests, error } = await supabase.rpc(
        'get_filtered_requests',
        { 
          p_work_center: selectedWorkCenter || null,
          p_start_date: startDate ? new Date(startDate).toISOString() : null,
          p_end_date: endDate ? new Date(endDate + 'T23:59:59').toISOString() : null
        }
      );

      if (error) throw error;

      const filteredRequests = requests.filter(req => 
        filter === 'all' || req.request_status === filter
      );

      setRequests(filteredRequests);

      const pendingCount = requests.filter(req => req.request_status === 'pending').length;
      setPendingRequestsCount(pendingCount);

    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId: string, type: string, newStatus: 'approved' | 'rejected') => {
    try {
      let table = '';
      switch (type) {
        case 'time':
          table = 'time_requests';
          break;
        case 'planner':
          table = 'planner_requests';
          break;
        default:
          console.error('Tipo de solicitud no válido:', type);
          return;
      }

      const { error } = await supabase
        .from(table)
        .update({ status: newStatus })
        .eq('id', requestId);

      if (error) throw error;

      setRequests(requests.map(req =>
        req.request_id === requestId ? { ...req, request_status: newStatus } : req
      ));

      if (newStatus === 'approved' || newStatus === 'rejected') {
        setPendingRequestsCount(prevCount => prevCount - 1);
      }

    } catch (error) {
      console.error('Error updating request status:', error);
    }
  };

  const handleExportExcel = () => {
    const exportData = requests.map(request => ({
      'Nombre': request.employee_name,
      'Email': request.employee_email,
      'Centros de Trabajo': request.work_centers?.join(', ') || '',
      'Tipo de Solicitud': getRequestTypeText(request.request_type),
      'Estado': getStatusText(request.request_status),
      'Fecha de Solicitud': new Date(request.created_at).toLocaleString(),
      'Detalles': request.request_type === 'time' 
        ? `${new Date(request.details.datetime).toLocaleString()} - ${getEntryTypeText(request.details.entry_type)}`
        : `${request.details.planner_type} (${new Date(request.details.start_date).toLocaleDateString()} - ${new Date(request.details.end_date).toLocaleDateString()})`,
      'Comentario': request.details.comment
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Solicitudes');
    
    const filename = `solicitudes_${selectedWorkCenter?.replace(/\s+/g, '_') || 'todos'}_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    XLSX.writeFile(wb, filename);
  };

  const getRequestTypeText = (type: string) => {
    switch (type) {
      case 'time': return 'Fichaje';
      case 'planner': return 'Planificador';
      default: return type;
    }
  };

  const getStatusBadgeClasses = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Aprobada';
      case 'rejected': return 'Rechazada';
      case 'pending': return 'Pendiente';
      default: return status;
    }
  };

  const getEntryTypeText = (type: string) => {
    switch (type) {
      case 'clock_in': return 'Entrada';
      case 'break_start': return 'Inicio Pausa';
      case 'break_end': return 'Fin Pausa';
      case 'clock_out': return 'Salida';
      default: return type;
    }
  };

  const renderRequestDetails = (request: Request) => {
    switch (request.request_type) {
      case 'time':
        return (
          <>
            <p className="text-sm text-gray-600">
              <strong>Fecha y hora:</strong> {new Date(request.details.datetime).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Tipo:</strong> {getEntryTypeText(request.details.entry_type)}
            </p>
          </>
        );
      case 'planner':
        return (
          <>
            <p className="text-sm text-gray-600">
              <strong>Tipo:</strong> {request.details.planner_type}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Fecha inicio:</strong> {new Date(request.details.start_date).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Fecha fin:</strong> {new Date(request.details.end_date).toLocaleDateString()}
            </p>
          </>
        );
      default:
        return null;
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.employee_email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
                Solicitudes
                {pendingRequestsCount > 0 && (
                  <span className="bg-red-500 text-white rounded-full px-2 py-1 text-xs">
                    {pendingRequestsCount}
                  </span>
                )}
              </h1>
              <p className="text-gray-600">Centro de Trabajo: {selectedWorkCenter || 'Todos los centros'}</p>
            </div>
            <div className="space-y-2">
              <select
                value={selectedWorkCenter}
                onChange={(e) => setSelectedWorkCenter(e.target.value)}
                className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <option value="">Todos los centros</option>
                {workCenters.map((center, index) => (
                  <option key={index} value={center}>
                    {center}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'pending'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Pendientes
              {pendingRequestsCount > 0 && (
                <span className="ml-2 bg-red-500 text-white rounded-full px-2 py-1 text-xs">
                  {pendingRequestsCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'approved'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Aprobadas
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'rejected'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Rechazadas
            </button>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              Exportar a Excel
            </button>

            <div className="flex gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Inicio
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Fin
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar solicitudes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p>Cargando solicitudes...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No hay solicitudes que mostrar</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empleado
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Detalles
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Solicitud
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <tr key={request.request_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {request.employee_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {request.employee_email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {getRequestTypeText(request.request_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {renderRequestDetails(request)}
                      <p className="text-sm text-gray-500 mt-1">
                        <strong>Comentario:</strong> {request.details.comment}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        getStatusBadgeClasses(request.request_status)
                      }`}>
                        {getStatusText(request.request_status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {request.request_status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateStatus(request.request_id, request.request_type, 'approved')}
                            className="p-1 text-green-600 hover:text-green-800"
                            title="Aprobar"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(request.request_id, request.request_type, 'rejected')}
                            className="p-1 text-red-600 hover:text-red-800"
                            title="Rechazar"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default CompanyRequests;