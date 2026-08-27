'use client';

import React, { useEffect, useMemo, useState } from 'react';
import api from '@/services/api';
import {
  Users,
  Plus,
  Search,
  Loader2,
  X,
  ArrowUpRight,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';

const STATUS_LABELS: Record<string, string> = {
  PRESENTACION_CV: 'Presentación de CV',
  SEGURIDAD: 'Seguridad Antamina',
  EVALUACION: 'Evaluación CV',
  ENTREVISTA: 'Entrevista',
  MEDICO: 'Examen médico',
  INDUCCION: 'Inducción',
  CONTRATADO: 'Subida al trabajo',
  RECHAZADO: 'Rechazado',
};

const DEFAULT_SUBSTATUS: Record<string, string> = {
  PRESENTACION_CV: 'ENVIADO',
  SEGURIDAD: 'APROBADO',
  EVALUACION: 'APROBADO',
  ENTREVISTA: 'APROBADO',
  MEDICO: 'APROBADO_SIN_OBSERVACION',
  INDUCCION: 'APROBADO',
  CONTRATADO: 'SUBIDA_CONFIRMADA',
  RECHAZADO: 'CERRADO',
};

export default function PostulacionesPage() {
  const [postulaciones, setPostulaciones] = useState<any[]>([]);
  const [ofertas, setOfertas] = useState<any[]>([]);
  const [comuneros, setComuneros] = useState<any[]>([]);
  const [catalogo, setCatalogo] = useState<any>(null);
  const [reporte, setReporte] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'lista' | 'reporte'>('lista');

  const [isPostularOpen, setIsPostularOpen] = useState(false);
  const [isAvanceOpen, setIsAvanceOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [formPostular, setFormPostular] = useState({ ofertaId: '', userId: '', notes: '' });
  const [formAvance, setFormAvance] = useState({
    newStatus: '',
    subStatus: '',
    notes: '',
    deadline: '',
    horasInduccion: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userRole, setUserRole] = useState('ADMIN');

  const canPostularTerceros = ['DIRECTIVA', 'EMPRESA', 'ADMIN'].includes(userRole);
  const canAvanzar = ['DIRECTIVA', 'EMPRESA', 'ADMIN'].includes(userRole);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [postRes, ofRes, comRes, catRes, repRes] = await Promise.all([
        api.get('/postulaciones'),
        api.get('/ofertas?todas=1'),
        api.get('/postulaciones/comuneros'),
        api.get('/postulaciones/catalogo-etapas'),
        api.get('/postulaciones/reporte'),
      ]);
      setPostulaciones(Array.isArray(postRes.data) ? postRes.data : []);
      setOfertas(Array.isArray(ofRes.data) ? ofRes.data : []);
      setComuneros(Array.isArray(comRes.data) ? comRes.data : []);
      setCatalogo(catRes.data);
      setReporte(Array.isArray(repRes.data) ? repRes.data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('sigeli_user');
    if (stored) {
      try {
        setUserRole(JSON.parse(stored)?.role || 'ADMIN');
      } catch {
        /* ignore */
      }
    }
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return postulaciones;
    return postulaciones.filter((p) =>
      [p.user?.fullName, p.user?.dni, p.oferta?.title, p.stageLabel, p.status]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [postulaciones, query]);

  const handlePostular = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPostular.ofertaId || !formPostular.userId) {
      alert('Seleccione oferta y comunero.');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post('/postulaciones', formPostular);
      setIsPostularOpen(false);
      setFormPostular({ ofertaId: '', userId: '', notes: '' });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAvance = (p: any) => {
    setSelected(p);
    const next =
      catalogo?.pipeline?.find((s: any) => s.status === p.status)?.status || p.status;
    // Sugerir siguiente etapa del pipeline
    const order = catalogo?.pipeline?.map((s: any) => s.status) || [];
    const idx = order.indexOf(p.status);
    const suggested = idx >= 0 && idx < order.length - 1 ? order[idx + 1] : p.status;
    setFormAvance({
      newStatus: suggested,
      subStatus: DEFAULT_SUBSTATUS[suggested] || '',
      notes: '',
      deadline: '',
      horasInduccion: '',
    });
    setIsAvanceOpen(true);
  };

  const subOptions = useMemo(() => {
    const stage = catalogo?.pipeline?.find((s: any) => s.status === formAvance.newStatus);
    return stage?.subStatuses || [];
  }, [catalogo, formAvance.newStatus]);

  const handleAvance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !formAvance.newStatus) return;
    setIsSubmitting(true);
    try {
      await api.patch(`/postulaciones/${selected.id}/avance`, {
        newStatus: formAvance.newStatus,
        subStatus: formAvance.subStatus || undefined,
        notes: formAvance.notes || undefined,
        deadline: formAvance.deadline || undefined,
        meta: formAvance.horasInduccion
          ? { horasInduccion: Number(formAvance.horasInduccion) }
          : undefined,
      });
      setIsAvanceOpen(false);
      setSelected(null);
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      alert(Array.isArray(msg) ? msg.join(', ') : msg || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Postulación inteligente</h1>
          <p className="text-slate-500">
            Timeline Antamina, postulación por Directiva y reporte de postulantes.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setTab('lista')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              tab === 'lista' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600'
            }`}
          >
            Seguimiento
          </button>
          <button
            onClick={() => setTab('reporte')}
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
              tab === 'reporte' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Reporte
          </button>
          {canPostularTerceros && (
            <button
              onClick={() => setIsPostularOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Postular comunero
            </button>
          )}
        </div>
      </div>

      {userRole === 'DIRECTIVA' && (
        <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          Como <strong>Directiva Comunal</strong> puedes enviar el CV de un comunero a una oferta,
          ver el timeline y generar el reporte de postulantes por puesto.
        </div>
      )}

      {tab === 'lista' ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por comunero, DNI o puesto..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1000px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Puesto</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Postulante</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Enviado por</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Matching</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Timeline</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Estado</th>
                  {canAvanzar && (
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Acciones</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-red-500">{error}</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      No hay postulaciones.
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{p.oferta?.title}</div>
                        <div className="text-xs text-slate-500">{p.oferta?.companyName || p.oferta?.sector}</div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div>{p.user?.fullName}</div>
                        <div className="font-mono text-xs text-slate-500">{p.user?.dni}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {p.submittedBy
                          ? `${p.submittedBy.fullName} (${p.submittedBy.role})`
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold">
                        {p.aiMatchingScore != null ? `${p.aiMatchingScore}%` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {(p.visualTimeline || [])
                            .filter((s: any) => s.stage !== 'RECHAZADO')
                            .map((s: any) => (
                              <div
                                key={s.stage}
                                title={s.label}
                                className={`w-2.5 h-2.5 rounded-full ${
                                  s.state === 'completed'
                                    ? 'bg-green-500'
                                    : s.state === 'current'
                                      ? 'bg-blue-600 ring-2 ring-blue-200'
                                      : s.state === 'rejected'
                                        ? 'bg-red-500'
                                        : 'bg-slate-200'
                                }`}
                              />
                            ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            p.status === 'CONTRATADO'
                              ? 'bg-green-100 text-green-800'
                              : p.status === 'RECHAZADO'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {p.stageLabel || STATUS_LABELS[p.status] || p.status}
                        </span>
                      </td>
                      {canAvanzar && (
                        <td className="px-4 py-3">
                          {p.status !== 'CONTRATADO' && p.status !== 'RECHAZADO' && (
                            <button
                              onClick={() => openAvance(p)}
                              className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 rounded-lg"
                              title="Avanzar etapa"
                            >
                              <ArrowUpRight className="w-5 h-5" />
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {loading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : reporte.length === 0 ? (
            <p className="text-slate-500 text-center py-12">Sin datos de reporte.</p>
          ) : (
            reporte.map((r) => (
              <div key={r.ofertaId} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{r.puesto}</h3>
                    <p className="text-sm text-slate-500">
                      {r.empresa || 'Sin empresa'} · {r.sector}
                    </p>
                  </div>
                  <div className="flex gap-3 text-sm">
                    <span className="px-2 py-1 bg-slate-100 rounded">Total: {r.totalPostulantes}</span>
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">En proceso: {r.enProceso}</span>
                    <span className="px-2 py-1 bg-green-50 text-green-700 rounded">Contratados: {r.contratados}</span>
                    <span className="px-2 py-1 bg-red-50 text-red-700 rounded">Rechazados: {r.rechazados}</span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-slate-500 uppercase border-b">
                        <th className="py-2 pr-3">Nombre</th>
                        <th className="py-2 pr-3">DNI</th>
                        <th className="py-2 pr-3">Puesto</th>
                        <th className="py-2 pr-3">Estado</th>
                        <th className="py-2 pr-3">Enviado por</th>
                        <th className="py-2">Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {r.postulantes.map((p: any) => (
                        <tr key={p.postulacionId} className="border-b border-slate-100">
                          <td className="py-2 pr-3 font-medium">{p.nombre}</td>
                          <td className="py-2 pr-3 font-mono text-xs">{p.dni}</td>
                          <td className="py-2 pr-3">{p.puesto}</td>
                          <td className="py-2 pr-3">{p.estadoLabel}</td>
                          <td className="py-2 pr-3 text-xs">{p.enviadoPor}</td>
                          <td className="py-2 text-xs">
                            {p.fecha ? new Date(p.fecha).toLocaleDateString() : '—'}
                          </td>
                        </tr>
                      ))}
                      {r.postulantes.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-4 text-slate-400 text-center">
                            Sin postulantes aún
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal postular */}
      {isPostularOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold">Postular comunero a oferta</h2>
              </div>
              <button onClick={() => setIsPostularOpen(false)}>
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handlePostular} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Oferta vigente</label>
                <select
                  required
                  value={formPostular.ofertaId}
                  onChange={(e) => setFormPostular({ ...formPostular, ofertaId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="">Seleccione...</option>
                  {ofertas
                    .filter((o) => o.status === 'VIGENTE')
                    .map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.title} — {o.company || o.companyName}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Comunero</label>
                <select
                  required
                  value={formPostular.userId}
                  onChange={(e) => setFormPostular({ ...formPostular, userId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="">Seleccione...</option>
                  {comuneros.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} ({c.dni})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nota (opcional)</label>
                <textarea
                  value={formPostular.notes}
                  onChange={(e) => setFormPostular({ ...formPostular, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg h-20 resize-none"
                  placeholder="Ej. Prioridad comunitaria sector Huari"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPostularOpen(false)}
                  className="flex-1 border rounded-lg py-2"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 text-white rounded-lg py-2 font-semibold disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Enviar CV'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal avance */}
      {isAvanceOpen && selected && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-5 border-b bg-slate-50 flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold">Avanzar etapa</h2>
                <p className="text-xs text-slate-500">
                  {selected.user?.fullName} · {selected.oferta?.title}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Actual: {selected.stageLabel || STATUS_LABELS[selected.status]}
                </p>
              </div>
              <button onClick={() => setIsAvanceOpen(false)}>
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleAvance} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nueva etapa</label>
                <select
                  required
                  value={formAvance.newStatus}
                  onChange={(e) =>
                    setFormAvance({
                      ...formAvance,
                      newStatus: e.target.value,
                      subStatus: DEFAULT_SUBSTATUS[e.target.value] || '',
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  {(catalogo?.pipeline || []).map((s: any) => (
                    <option key={s.status} value={s.status}>
                      {s.label}
                    </option>
                  ))}
                  <option value="RECHAZADO">Rechazado / desestimado</option>
                </select>
              </div>
              {subOptions.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-1">Subestado</label>
                  <select
                    value={formAvance.subStatus}
                    onChange={(e) => setFormAvance({ ...formAvance, subStatus: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    <option value="">—</option>
                    {subOptions.map((s: string) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {formAvance.newStatus === 'INDUCCION' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Horas de inducción</label>
                  <input
                    type="number"
                    min={1}
                    value={formAvance.horasInduccion}
                    onChange={(e) =>
                      setFormAvance({ ...formAvance, horasInduccion: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Fecha límite etapa (alerta)</label>
                <input
                  type="date"
                  value={formAvance.deadline}
                  onChange={(e) => setFormAvance({ ...formAvance, deadline: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Comentarios / motivo</label>
                <textarea
                  value={formAvance.notes}
                  onChange={(e) => setFormAvance({ ...formAvance, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg h-24 resize-none"
                  placeholder="Obligatorio en desaprobaciones / observaciones"
                />
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-800 flex gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                Solo se permiten transiciones secuenciales del pipeline Antamina (o rechazo). Al
                llegar a &quot;Subida al trabajo&quot; se genera el contrato automáticamente.
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAvanceOpen(false)}
                  className="flex-1 border rounded-lg py-2"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 text-white rounded-lg py-2 font-bold disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Actualizar fase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
