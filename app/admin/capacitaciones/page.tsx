'use client';

import React, { useEffect, useMemo, useState } from 'react';
import api from '@/services/api';
import {
  GraduationCap,
  TrendingUp,
  Award,
  Search,
  ChevronRight,
  PlayCircle,
  Clock,
  Loader2,
  X,
  Plus,
  Users,
} from 'lucide-react';

type TipoCap = 'ALL' | 'CV_HISTORIAL' | 'PROGRAMA_ENTRENAMIENTO';

export default function CapacitacionesPage() {
  const [capacitaciones, setCapacitaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [porcentajeAscenso, setPorcentajeAscenso] = useState(0);
  const [participantesEntrenamiento, setParticipantesEntrenamiento] = useState(0);
  const [filtroTipo, setFiltroTipo] = useState<TipoCap>('ALL');

  const [formData, setFormData] = useState({
    title: '',
    sector: '',
    entidad: '',
    anio: new Date().getFullYear(),
    duracion: 1,
    description: '',
    tipo: 'CV_HISTORIAL' as 'CV_HISTORIAL' | 'PROGRAMA_ENTRENAMIENTO',
    socioOrganizador: '',
  });

  const fetchCapacitaciones = async () => {
    setLoading(true);
    try {
      const [capRes, iaRes, dashRes] = await Promise.all([
        api.get('/capacitaciones'),
        api.get('/capacitaciones/metricas-ia').catch(() => ({ data: { porcentajeAscenso: 0 } })),
        api.get('/analitica/dashboards').catch(() => ({ data: null })),
      ]);
      setCapacitaciones(capRes.data || []);
      setPorcentajeAscenso(iaRes.data?.porcentajeAscenso ?? 0);
      setParticipantesEntrenamiento(
        dashRes.data?.programaEntrenamiento?.participantes ?? 0,
      );
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

  const filtered = useMemo(() => {
    if (filtroTipo === 'ALL') return capacitaciones;
    return capacitaciones.filter((c) => c.tipo === filtroTipo);
  }, [capacitaciones, filtroTipo]);

  const historialCount = capacitaciones.filter((c) => c.tipo === 'CV_HISTORIAL' || !c.tipo).length;
  const programaCount = capacitaciones.filter((c) => c.tipo === 'PROGRAMA_ENTRENAMIENTO').length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/capacitaciones', {
        title: formData.title,
        description: formData.description || `Programa de capacitación en ${formData.sector}`,
        sector: formData.sector,
        tipo: formData.tipo,
        socioOrganizador:
          formData.tipo === 'PROGRAMA_ENTRENAMIENTO'
            ? formData.socioOrganizador || formData.entidad || undefined
            : undefined,
        learningPath: {
          entidad: formData.entidad,
          anio: formData.anio,
          duracion: formData.duracion,
        },
      });
      setShowModal(false);
      setFormData({
        title: '',
        sector: '',
        entidad: '',
        anio: new Date().getFullYear(),
        duracion: 1,
        description: '',
        tipo: 'CV_HISTORIAL',
        socioOrganizador: '',
      });
      fetchCapacitaciones();
    } catch (err) {
      alert('Error al crear el programa de capacitación');
    } finally {
      setSubmitting(false);
    }
  };

  const completionRate =
    filtered.length > 0
      ? Math.round(
          (filtered.reduce(
            (acc, c) => acc + (c.usuarios?.filter((u: any) => u.isCertified).length || 0),
            0,
          ) /
            Math.max(
              filtered.reduce((acc, c) => acc + (c.usuarios?.length || 0), 0),
              1,
            )) *
            100,
        )
      : 0;

  const totalHours = filtered.reduce((acc, c) => acc + (c.learningPath?.duracion || 0) * 20, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Capacitaciones vs Entrenamiento</h1>
          <p className="text-slate-500">
            Separa el historial del CV del programa de entrenamiento laboral (Antamina / socio), que
            alimenta el indicador del dashboard.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Crear curso</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            { id: 'ALL' as const, label: 'Todos' },
            { id: 'CV_HISTORIAL' as const, label: 'Historial CV' },
            { id: 'PROGRAMA_ENTRENAMIENTO' as const, label: 'Programa entrenamiento' },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setFiltroTipo(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
              filtroTipo === t.id
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="p-2 bg-blue-50 rounded-lg w-fit mb-3">
            <GraduationCap className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800">{loading ? '...' : historialCount}</h3>
          <p className="text-slate-500 text-sm">Cursos historial CV</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="p-2 bg-cyan-50 rounded-lg w-fit mb-3">
            <PlayCircle className="w-5 h-5 text-cyan-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800">{loading ? '...' : programaCount}</h3>
          <p className="text-slate-500 text-sm">Cursos programa</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="p-2 bg-violet-50 rounded-lg w-fit mb-3">
            <Users className="w-5 h-5 text-violet-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800">
            {loading ? '...' : participantesEntrenamiento}
          </h3>
          <p className="text-slate-500 text-sm">Participantes entrenamiento</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="p-2 bg-green-50 rounded-lg w-fit mb-3">
            <Award className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800">
            {loading
              ? '...'
              : filtered.reduce(
                  (acc, c) => acc + (c.usuarios?.filter((u: any) => u.isCertified).length || 0),
                  0,
                )}
          </h3>
          <p className="text-slate-500 text-sm">Certificaciones</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="p-2 bg-amber-50 rounded-lg w-fit mb-3">
            <TrendingUp className="w-5 h-5 text-amber-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800">{loading ? '...' : `${completionRate}%`}</h3>
          <p className="text-slate-500 text-sm">Tasa finalización (filtro)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-bold text-slate-800">
                {filtroTipo === 'PROGRAMA_ENTRENAMIENTO'
                  ? 'Programa de entrenamiento laboral'
                  : filtroTipo === 'CV_HISTORIAL'
                    ? 'Historial de capacitaciones (CV)'
                    : 'Todos los cursos'}
              </h2>
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
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">Cargando…</p>
                </div>
              ) : error ? (
                <div className="p-12 text-center text-red-500 font-medium">{error}</div>
              ) : filtered.length === 0 ? (
                <div className="p-12 text-center text-slate-500">No hay cursos en este filtro.</div>
              ) : (
                filtered.map((curso) => (
                  <div
                    key={curso.id}
                    className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                        <PlayCircle className="w-6 h-6 text-slate-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{curso.title}</h4>
                        <div className="flex items-center flex-wrap gap-2 mt-1">
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              curso.tipo === 'PROGRAMA_ENTRENAMIENTO'
                                ? 'text-violet-700 bg-violet-50'
                                : 'text-blue-600 bg-blue-50'
                            }`}
                          >
                            {curso.tipo === 'PROGRAMA_ENTRENAMIENTO'
                              ? 'Programa entrenamiento'
                              : 'Historial CV'}
                          </span>
                          <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                            {curso.sector}
                          </span>
                          {curso.socioOrganizador && (
                            <span className="text-xs text-slate-500">{curso.socioOrganizador}</span>
                          )}
                          <span className="text-xs text-slate-500 flex items-center">
                            <Clock className="w-3 h-3 mr-1" /> {curso.learningPath?.duracion || '--'}{' '}
                            meses
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-8">
                      <div className="text-right hidden sm:block">
                        <div className="text-sm font-bold text-slate-800">
                          {curso.usuarios?.filter((u: any) => u.isCertified).length || 0} /{' '}
                          {curso.usuarios?.length || 0}
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
            <h2 className="font-bold text-slate-800 mb-2">Indicador dashboard</h2>
            <p className="text-sm text-slate-500 mb-4">
              Personas con encuesta SI (Antamina) o inscritas en cursos del programa.
            </p>
            <div className="text-4xl font-bold text-violet-700">{participantesEntrenamiento}</div>
            <p className="text-xs text-slate-400 mt-1">participantes · {totalHours}h estimadas en filtro</p>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 text-white shadow-lg">
            <h2 className="font-bold text-lg mb-2">IA de Trayectoria</h2>
            <p className="text-blue-100 text-sm mb-4">
              El {porcentajeAscenso}% de comuneros está en rutas activas de capacitación.
            </p>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Registrar curso</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                <select
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none"
                  value={formData.tipo}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tipo: e.target.value as 'CV_HISTORIAL' | 'PROGRAMA_ENTRENAMIENTO',
                    })
                  }
                >
                  <option value="CV_HISTORIAL">Historial CV</option>
                  <option value="PROGRAMA_ENTRENAMIENTO">Programa entrenamiento laboral</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Sector</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none"
                    value={formData.sector}
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Entidad</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none"
                    value={formData.entidad}
                    onChange={(e) => setFormData({ ...formData, entidad: e.target.value })}
                  />
                </div>
              </div>

              {formData.tipo === 'PROGRAMA_ENTRENAMIENTO' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Socio organizador
                  </label>
                  <input
                    type="text"
                    placeholder="Antamina, Ferreyros…"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none"
                    value={formData.socioOrganizador}
                    onChange={(e) => setFormData({ ...formData, socioOrganizador: e.target.value })}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Año</label>
                  <input
                    type="number"
                    required
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none"
                    value={formData.anio}
                    onChange={(e) => setFormData({ ...formData, anio: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Duración (meses)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none"
                    value={formData.duracion}
                    onChange={(e) => setFormData({ ...formData, duracion: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                <textarea
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg h-20 resize-none outline-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="pt-2 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold disabled:opacity-50 flex items-center justify-center"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
