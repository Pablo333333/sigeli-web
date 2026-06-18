'use client';

import React, { useEffect, useState } from 'react';
import api from '@/services/api';
import { 
  Briefcase, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle2, 
  Users,
  ArrowUpRight,
  Loader2,
  X
} from 'lucide-react';

export default function OfertasPage() {
  const [postulaciones, setPostulaciones] = useState<any[]>([]);
  const [ofertas, setOfertas] = useState<any[]>([]);
  const [comuneros, setComuneros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedPostulacion, setSelectedPostulacion] = useState<any>(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [formData, setFormData] = useState({
    ofertaId: '',
    userId: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [postRes, ofRes, comRes] = await Promise.all([
        api.get('/postulaciones'),
        api.get('/ofertas'),
        api.get('/postulaciones/comuneros')
      ]);
      setPostulaciones(postRes.data);
      setOfertas(ofRes.data);
      setComuneros(comRes.data);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ofertaId || !formData.userId) {
      alert('Por favor selecciona tanto la oferta como el comunero.');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post('/postulaciones', formData);
      setIsModalOpen(false);
      setFormData({ ofertaId: '', userId: '' });
      fetchData();
    } catch (err: any) {
      alert(`Error al guardar: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatus) return;
    setIsSubmitting(true);
    try {
      await api.patch(`/postulaciones/${selectedPostulacion.id}/status`, {
        newStatus,
        notes: statusNotes
      });
      setIsStatusModalOpen(false);
      setSelectedPostulacion(null);
      setNewStatus('');
      setStatusNotes('');
      fetchData();
    } catch (err: any) {
      alert(`Error al actualizar estado: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const timelineSteps = [
    'PRESENTACION_CV',
    'SEGURIDAD',
    'EVALUACION',
    'ENTREVISTA',
    'MEDICO',
    'INDUCCION',
    'CONTRATADO'
  ];

  const statusLabels: Record<string, string> = {
    'PRESENTACION_CV': 'Presentación de CV',
    'SEGURIDAD': 'Evaluación de Seguridad',
    'EVALUACION': 'Evaluación de CV',
    'ENTREVISTA': 'Entrevista',
    'MEDICO': 'Examen Médico',
    'INDUCCION': 'Inducción',
    'CONTRATADO': 'Subida al trabajo (Contratado)',
    'RECHAZADO': 'Desestimado'
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gestión de Postulaciones y Ofertas</h1>
          <p className="text-slate-500">Administra las vacantes y el seguimiento de los postulantes.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Nueva Postulación</span>
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">Nueva Postulación</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Oferta Laboral Vigente</label>
                <select 
                  required
                  value={formData.ofertaId}
                  onChange={(e) => setFormData({...formData, ofertaId: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
                >
                  <option value="">Seleccione una oferta...</option>
                  {ofertas.map(o => (
                    <option key={o.id} value={o.id}>{o.title} - {o.sector}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Comunero Postulante</label>
                <select 
                  required
                  value={formData.userId}
                  onChange={(e) => setFormData({...formData, userId: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
                >
                  <option value="">Seleccione un comunero...</option>
                  {comuneros.map(c => (
                    <option key={c.id} value={c.id}>{c.fullName} ({c.dni})</option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Flujo Automático de Postulación</label>
                <div className="flex items-center justify-between relative">
                  <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0"></div>
                  {timelineSteps.map((step, idx) => (
                    <div key={step} className="relative z-10 flex flex-col items-center group">
                      <div className={`w-3 h-3 rounded-full border-2 transition-colors ${idx === 0 ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-200'}`}></div>
                      <div className="absolute top-5 scale-0 group-hover:scale-100 transition-transform origin-top bg-slate-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">
                        {step}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-4 text-center italic">
                  La postulación iniciará automáticamente en el estado: <strong>{statusLabels[timelineSteps[0]]}</strong>
                </p>
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

      {/* Modal de Cambio de Estado */}
      {isStatusModalOpen && selectedPostulacion && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Actualizar Seguimiento</h2>
                <p className="text-xs text-slate-500">{selectedPostulacion.user?.fullName} - {selectedPostulacion.oferta?.title}</p>
              </div>
              <button onClick={() => setIsStatusModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleUpdateStatus} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nuevo Estado del Proceso</label>
                <select 
                  required
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Comentarios / Observaciones</label>
                <textarea 
                  placeholder="Ingrese detalles del avance o motivo de rechazo..."
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all h-24 resize-none"
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <p className="text-xs text-blue-700 leading-relaxed">
                  <strong>Nota:</strong> Al cambiar el estado a <em>'Subida al trabajo'</em>, el sistema generará automáticamente el contrato legal y actualizará los indicadores de contratación.
                </p>
              </div>

              <div className="pt-2 flex space-x-3">
                <button 
                  type="button"
                  onClick={() => setIsStatusModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 font-bold"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Actualizar Fase</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-slate-800">
            {loading ? '...' : new Set(postulaciones.map(p => p.ofertaId)).size}
          </h3>
          <p className="text-slate-500 text-sm">Ofertas con Postulantes</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-slate-800">{loading ? '...' : postulaciones.length}</h3>
          <p className="text-slate-500 text-sm">Postulaciones Totales</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-amber-50 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-slate-800">
            {loading ? '...' : postulaciones.filter(p => p.status === 'CONTRATADO').length}
          </h3>
          <p className="text-slate-500 text-sm">Contrataciones</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Buscar por cargo, empresa o postulante..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
              <Filter className="w-4 h-4" />
              <span>Filtros</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Oferta / Sector</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Postulante</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">DNI</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Matching IA</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                      <p className="text-slate-500 text-sm">Cargando datos...</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-red-500 font-medium">
                    {error}
                  </td>
                </tr>
              ) : postulaciones.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No hay postulaciones registradas actualmente.
                  </td>
                </tr>
              ) : (
                postulaciones.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{p.oferta?.title || 'Oferta sin título'}</div>
                      <div className="text-sm text-slate-500">{p.oferta?.sector || 'Sector no especificado'}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{p.user?.fullName || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-mono">{p.user?.dni || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full max-w-[100px]">
                          <div 
                            className={`h-full rounded-full ${p.aiMatchingScore !== null && p.aiMatchingScore !== undefined ? 'bg-blue-500' : 'bg-slate-300'}`} 
                            style={{ width: `${p.aiMatchingScore ?? 0}%` }}
                          ></div>
                        </div>
                        <span className={`text-sm font-semibold ${p.aiMatchingScore !== null && p.aiMatchingScore !== undefined ? 'text-slate-700' : 'text-slate-400 italic'}`}>
                          {p.aiMatchingScore !== null && p.aiMatchingScore !== undefined ? `${p.aiMatchingScore}%` : 'Procesando...'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        p.status === 'PRESENTACION_CV' ? 'bg-blue-100 text-blue-800' :
                        p.status === 'CONTRATADO' ? 'bg-green-100 text-green-800' :
                        p.status === 'RECHAZADO' ? 'bg-red-100 text-red-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {statusLabels[p.status] || p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => {
                            setSelectedPostulacion(p);
                            setNewStatus(p.status);
                            setIsStatusModalOpen(true);
                          }}
                          className="p-2 text-slate-400 hover:text-blue-600 transition-colors bg-slate-50 rounded-lg"
                          title="Cambiar Estado"
                        >
                          <ArrowUpRight className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
