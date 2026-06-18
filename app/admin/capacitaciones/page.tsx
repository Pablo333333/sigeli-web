'use client';

import React, { useEffect, useState } from 'react';
import api from '@/services/api';
import { 
  GraduationCap, 
  BookOpen, 
  TrendingUp, 
  Award, 
  Search, 
  ChevronRight,
  PlayCircle,
  Clock,
  Loader2,
  X,
  Plus
} from 'lucide-react';

export default function CapacitacionesPage() {
  const [capacitaciones, setCapacitaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [porcentajeAscenso, setPorcentajeAscenso] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    sector: '',
    entidad: '',
    anio: new Date().getFullYear(),
    duracion: 1,
    description: ''
  });

  const fetchCapacitaciones = async () => {
    setLoading(true);
    try {
      const [capRes, iaRes] = await Promise.all([
        api.get('/capacitaciones'),
        api.get('/capacitaciones/metricas-ia')
      ]);
      setCapacitaciones(capRes.data);
      setPorcentajeAscenso(iaRes.data.porcentajeAscenso);
    } catch (err) {
      console.error('Error fetching capacitaciones:', err);
      setError('No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCapacitaciones();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/capacitaciones', {
        title: formData.title,
        description: formData.description || `Programa de capacitación en ${formData.sector}`,
        sector: formData.sector,
        learningPath: {
          entidad: formData.entidad,
          anio: formData.anio,
          duracion: formData.duracion
        }
      });
      setShowModal(false);
      setFormData({
        title: '',
        sector: '',
        entidad: '',
        anio: new Date().getFullYear(),
        duracion: 1,
        description: ''
      });
      fetchCapacitaciones();
    } catch (err) {
      alert('Error al crear el programa de capacitación');
    } finally {
      setSubmitting(false);
    }
  };

  const completionRate = capacitaciones.length > 0 
    ? Math.round((capacitaciones.reduce((acc, c) => acc + (c.usuarios?.filter((u: any) => u.isCertified).length || 0), 0) / 
      capacitaciones.reduce((acc, c) => acc + (c.usuarios?.length || 0), 0)) * 100)
    : 0;

  const totalHours = capacitaciones.reduce((acc, c) => acc + (c.learningPath?.duracion || 0) * 20, 0); // Estimación: 20h por mes

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Trayectorias y Capacitaciones</h1>
          <p className="text-slate-500">Monitorea el desarrollo de habilidades y rutas de aprendizaje de la comunidad.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Crear Ruta</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="p-2 bg-blue-50 rounded-lg w-fit mb-4">
            <GraduationCap className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800">{loading ? '...' : capacitaciones.length}</h3>
          <p className="text-slate-500 text-sm">Programas Activos</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="p-2 bg-green-50 rounded-lg w-fit mb-4">
            <Award className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800">
            {loading ? '...' : capacitaciones.reduce((acc, c) => acc + (c.usuarios?.filter((u: any) => u.isCertified).length || 0), 0)}
          </h3>
          <p className="text-slate-500 text-sm">Certificaciones Emitidas</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="p-2 bg-amber-50 rounded-lg w-fit mb-4">
            <TrendingUp className="w-6 h-6 text-amber-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800">{loading ? '...' : `${completionRate}%`}</h3>
          <p className="text-slate-500 text-sm">Tasa de Finalización</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="p-2 bg-purple-50 rounded-lg w-fit mb-4">
            <Clock className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800">{loading ? '...' : `${totalHours}h`}</h3>
          <p className="text-slate-500 text-sm">Total Horas Estimadas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-bold text-slate-800">Programas de Capacitación</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Buscar curso..." 
                  className="pl-9 pr-4 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
            
            <div className="divide-y divide-slate-200">
              {loading ? (
                <div className="p-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    <p className="text-slate-500 text-sm">Cargando capacitaciones...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="p-12 text-center text-red-500 font-medium">{error}</div>
              ) : capacitaciones.length === 0 ? (
                <div className="p-12 text-center text-slate-500">No hay capacitaciones cargadas actualmente.</div>
              ) : (
                capacitaciones.map((curso) => (
                  <div key={curso.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                        <PlayCircle className="w-6 h-6 text-slate-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{curso.title}</h4>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{curso.sector}</span>
                          <span className="text-xs text-slate-500 flex items-center">
                            <Clock className="w-3 h-3 mr-1" /> {curso.learningPath?.duracion || '--'} meses
                          </span>
                          <span className="text-xs text-slate-400">| {curso.learningPath?.entidad || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-8">
                      <div className="text-right hidden sm:block">
                        <div className="text-sm font-bold text-slate-800">
                          {curso.usuarios?.filter((u: any) => u.isCertified).length || 0} / {curso.usuarios?.length || 0}
                        </div>
                        <div className="text-xs text-slate-500">Certificados</div>
                      </div>
                      <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="font-bold text-slate-800 mb-4">Habilidades más Demandadas</h2>
            <div className="space-y-4">
              {[
                { name: 'Operación de Excavadora', demand: 95, color: 'bg-blue-600' },
                { name: 'Seguridad Industrial', demand: 88, color: 'bg-green-600' },
                { name: 'Mantenimiento Eléctrico', demand: 72, color: 'bg-amber-600' },
                { name: 'Gestión Logística', demand: 64, color: 'bg-purple-600' },
              ].map((skill) => (
                <div key={skill.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-700 font-medium">{skill.name}</span>
                    <span className="text-slate-500">{skill.demand}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full">
                    <div className={`h-full rounded-full ${skill.color}`} style={{ width: `${skill.demand}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg">
            <h2 className="font-bold text-lg mb-2">IA de Trayectoria</h2>
            <p className="text-blue-100 text-sm mb-4">
              Nuestro algoritmo sugiere que el {porcentajeAscenso}% de los comuneros están listos para ascender a roles técnicos tras completar sus rutas.
            </p>
            <button className="w-full bg-white text-blue-600 font-bold py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm">
              Ver Reporte de Talento
            </button>
          </div>
        </div>
      </div>

      {/* Modal para Crear Ruta */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Registrar Nuevo Entrenamiento</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Programa</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ej: Curso de Maquinaria Pesada"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tema / Sector</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ej: Minería"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    value={formData.sector}
                    onChange={(e) => setFormData({...formData, sector: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Entidad</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ej: Tecsup"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    value={formData.entidad}
                    onChange={(e) => setFormData({...formData, entidad: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Año</label>
                  <input 
                    type="number" 
                    required
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    value={formData.anio}
                    onChange={(e) => setFormData({...formData, anio: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Duración (meses)</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    value={formData.duracion}
                    onChange={(e) => setFormData({...formData, duracion: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción (Opcional)</label>
                <textarea 
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all h-20 resize-none"
                  placeholder="Breve descripción del curso..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="pt-2 flex space-x-3">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold disabled:opacity-50 flex items-center justify-center"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar Programa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
