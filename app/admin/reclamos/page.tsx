'use client';

import React, { useEffect, useState } from 'react';
import api from '@/services/api';
import { 
  MessageSquareWarning, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Search, 
  Filter,
  MapPin,
  Calendar,
  User,
  ArrowRight,
  Clock,
  Loader2,
  X
} from 'lucide-react';

export default function ReclamosPage() {
  const [reclamos, setReclamos] = useState<any[]>([]);
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [selectedReclamo, setSelectedReclamo] = useState<any>(null);
  const [formData, setFormData] = useState({
    tenantId: '',
    nombreAfectado: '',
    categoria: 'Incumplimiento de cuota local',
    motivo: ''
  });
  const [manageData, setManageData] = useState({
    estado: 'PENDIENTE',
    respuestaOficial: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReclamos = async () => {
    setLoading(true);
    try {
      const response = await api.get('/transparencia/reclamos');
      setReclamos(response.data);
    } catch (err) {
      console.error('Error fetching reclamos:', err);
      setError('No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmpresas = async () => {
    try {
      const response = await api.get('/transparencia/empresas');
      setEmpresas(response.data);
    } catch (err) {
      console.error('Error fetching empresas:', err);
    }
  };

  useEffect(() => {
    fetchReclamos();
    fetchEmpresas();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/transparencia/reclamos', formData);
      setIsModalOpen(false);
      setFormData({ 
        tenantId: '', 
        nombreAfectado: '', 
        categoria: 'Incumplimiento de cuota local', 
        motivo: '' 
      });
      fetchReclamos();
    } catch (err: any) {
      alert(`Error al guardar: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManageCase = (reclamo: any) => {
    setSelectedReclamo(reclamo);
    setManageData({
      estado: reclamo.estado,
      respuestaOficial: reclamo.respuestaOficial || ''
    });
    setIsManageModalOpen(true);
  };

  const handleUpdateReclamo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.patch(`/transparencia/reclamos/${selectedReclamo.id}/estado`, manageData);
      setIsManageModalOpen(false);
      fetchReclamos();
      alert('Caso actualizado exitosamente.');
    } catch (err: any) {
      alert(`Error al actualizar: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Centro de Mediación y Reclamos</h1>
          <p className="text-slate-500">Gestión de denuncias, alertas comunitarias y resolución de conflictos.</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-slate-50 transition-colors">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            <span>Alertas Activas</span>
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors shadow-sm"
          >
            <MessageSquareWarning className="w-5 h-5" />
            <span>Nuevo Registro</span>
          </button>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">Nuevo Registro de Reclamo</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Empresa / Contratista involucrada</label>
                <select 
                  required
                  value={formData.tenantId}
                  onChange={(e) => setFormData({...formData, tenantId: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  <option value="">Seleccione una empresa...</option>
                  {empresas.map((empresa) => (
                    <option key={empresa.id} value={empresa.id}>{empresa.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Afectado / Comunero</label>
                <input 
                  type="text" 
                  required
                  value={formData.nombreAfectado}
                  onChange={(e) => setFormData({...formData, nombreAfectado: e.target.value})}
                  placeholder="Nombre completo"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Motivo o Categoría del Reclamo</label>
                <select 
                  required
                  value={formData.categoria}
                  onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  <option value="Incumplimiento de cuota local">Incumplimiento de cuota local</option>
                  <option value="Problemas de pago">Problemas de pago</option>
                  <option value="Trato discriminatorio">Trato discriminatorio</option>
                  <option value="Condición logística">Condición logística</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción Detallada</label>
                <textarea 
                  required
                  value={formData.motivo}
                  onChange={(e) => setFormData({...formData, motivo: e.target.value})}
                  placeholder="Describe el problema detalladamente..."
                  rows={4}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                />
              </div>
              <div className="pt-4 flex space-x-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Guardar</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-red-50 rounded-full">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">--</div>
            <div className="text-xs text-slate-500 font-medium uppercase">Críticos</div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-50 rounded-full">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">
              {loading ? '...' : reclamos.filter(r => r.estado === 'PENDIENTE').length}
            </div>
            <div className="text-xs text-slate-500 font-medium uppercase">Pendientes</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-50 rounded-full">
            <ShieldAlert className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">
              {loading ? '...' : reclamos.filter(r => r.estado === 'EN_REVISION').length}
            </div>
            <div className="text-xs text-slate-500 font-medium uppercase">En Revisión</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-green-50 rounded-full">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">
              {loading ? '...' : reclamos.filter(r => r.estado === 'RESUELTO').length}
            </div>
            <div className="text-xs text-slate-500 font-medium uppercase">Resueltos</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Buscar por ID, usuario o motivo..." 
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <button className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-200">
          {loading ? (
            <div className="p-12 text-center">
              <div className="flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <p className="text-slate-500 text-sm">Cargando reclamos...</p>
              </div>
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-500 font-medium">{error}</div>
          ) : reclamos.length === 0 ? (
            <div className="p-12 text-center text-slate-500">No hay reclamos cargados actualmente.</div>
          ) : (
            reclamos.map((reclamo) => (
              <div key={reclamo.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded tracking-wider">
                        {reclamo.id.substring(0, 8).toUpperCase()}
                      </span>
                      <span className={`text-xs font-bold px-2 py-1 rounded tracking-wider ${
                        reclamo.estado === 'RESUELTO' ? 'bg-green-100 text-green-700' :
                        reclamo.estado === 'EN_REVISION' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {reclamo.estado}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-slate-900">{reclamo.motivo}</h3>
                    
                    <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-slate-500">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        <span className="font-medium text-slate-700">{reclamo.user?.fullName || 'Usuario Desconocido'}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        {reclamo.tenant?.name || 'Ubicación no especificada'}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(reclamo.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-4">
                    <button 
                      onClick={() => handleManageCase(reclamo)}
                      className="flex items-center space-x-2 text-blue-600 font-bold text-sm hover:text-blue-700 group"
                    >
                      <span>Gestionar Caso</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Gestionar Caso */}
      {isManageModalOpen && selectedReclamo && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Gestión de Caso</h2>
                <p className="text-xs font-bold text-blue-600 tracking-wider">ID: {selectedReclamo.id.substring(0, 8).toUpperCase()}</p>
              </div>
              <button onClick={() => setIsManageModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateReclamo} className="p-6 space-y-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase">Detalle del Reclamo</p>
                <p className="text-sm font-bold text-slate-800">{selectedReclamo.motivo}</p>
                <p className="text-xs text-slate-500 italic">Registrado por: {selectedReclamo.user?.fullName}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Estado del Caso</label>
                  <select 
                    required
                    value={manageData.estado}
                    onChange={(e) => setManageData({...manageData, estado: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  >
                    <option value="PENDIENTE">Vigente / Pendiente</option>
                    <option value="EN_REVISION">En Proceso / Revisión</option>
                    <option value="RESUELTO">Resuelto / Cerrado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Respuesta Oficial / Medidas Tomadas</label>
                  <textarea 
                    required
                    value={manageData.respuestaOficial}
                    onChange={(e) => setManageData({...manageData, respuestaOficial: e.target.value})}
                    placeholder="Escribe la respuesta formal para la comunidad..."
                    rows={5}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex space-x-3">
                <button 
                  type="button"
                  onClick={() => setIsManageModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Guardar Cambios</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
