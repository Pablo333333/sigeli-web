'use client';

import React, { useEffect, useMemo, useState } from 'react';
import api from '@/services/api';
import {
  Briefcase,
  Plus,
  Search,
  Loader2,
  X,
  Copy,
  Pencil,
  Trash2,
  Bell,
} from 'lucide-react';

const TIPO_MANO_OBRA = [
  { value: 'NO_CALIFICADA', label: 'Mano de obra no calificada' },
  { value: 'SEMI_CALIFICADA', label: 'Mano de obra semi calificada' },
  { value: 'CALIFICADA', label: 'Mano de obra calificada' },
  { value: 'PROFESIONAL', label: 'Profesional' },
  { value: 'TECNICO', label: 'Técnico' },
  { value: 'PRACTICAS', label: 'Prácticas profesionales' },
];

const EMPTY_FORM = {
  title: '',
  description: '',
  perfilRequisitos: '',
  salary: '',
  sector: '',
  vacancies: '1',
  status: 'VIGENTE',
  tenantId: '',
  companyName: '',
  tipoManoObra: 'NO_CALIFICADA',
  fechaInicioProyectada: '',
  fechaCierre: '',
  regimenLaboral: '',
  tiempoContratoMeses: '',
  horarioTrabajo: '',
  sistemaTrabajo: '',
  notaAviso: '',
};

type FormState = typeof EMPTY_FORM;

function toDateInput(value?: string | null) {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
}

export default function OfertasPage() {
  const [ofertas, setOfertas] = useState<any[]>([]);
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [showCulminadas, setShowCulminadas] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormState>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userRole, setUserRole] = useState<string>('ADMIN');

  const canWrite = userRole === 'ADMIN' || userRole === 'EMPRESA';

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ofRes, empRes] = await Promise.all([
        api.get(`/ofertas${showCulminadas ? '?todas=1' : ''}`),
        api.get('/transparencia/empresas'),
      ]);
      setOfertas(Array.isArray(ofRes.data) ? ofRes.data : []);
      setEmpresas(Array.isArray(empRes.data) ? empRes.data : []);
    } catch (err: any) {
      setError(`Error: ${err.response?.data?.message || err.message}`);
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
  }, []);

  useEffect(() => {
    fetchData();
  }, [showCulminadas]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ofertas;
    return ofertas.filter((o) =>
      [o.title, o.company, o.companyName, o.sector, o.tipoManoObra, o.estadoLabel]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [ofertas, query]);

  const openCreate = () => {
    setEditingId(null);
    setFormData({
      ...EMPTY_FORM,
      tenantId: empresas[0]?.id || '',
      companyName: empresas[0]?.name || '',
      fechaCierre: toDateInput(new Date(Date.now() + 30 * 86400000).toISOString()),
    });
    setIsModalOpen(true);
  };

  const openEdit = (oferta: any) => {
    setEditingId(oferta.id);
    setFormData({
      title: oferta.title || '',
      description: oferta.description || '',
      perfilRequisitos: oferta.perfilRequisitos || '',
      salary: String(oferta.salary ?? ''),
      sector: oferta.sector || '',
      vacancies: String(oferta.vacancies ?? 1),
      status: oferta.status || 'VIGENTE',
      tenantId: oferta.tenantId || oferta.tenant?.id || '',
      companyName: oferta.companyName || oferta.company || '',
      tipoManoObra: oferta.tipoManoObra || 'NO_CALIFICADA',
      fechaInicioProyectada: toDateInput(oferta.fechaInicioProyectada),
      fechaCierre: toDateInput(oferta.fechaCierre),
      regimenLaboral: oferta.regimenLaboral || '',
      tiempoContratoMeses: oferta.tiempoContratoMeses != null ? String(oferta.tiempoContratoMeses) : '',
      horarioTrabajo: oferta.horarioTrabajo || '',
      sistemaTrabajo: oferta.sistemaTrabajo || '',
      notaAviso: oferta.notaAviso || '',
    });
    setIsModalOpen(true);
  };

  const duplicateFrom = (oferta: any) => {
    openEdit(oferta);
    setEditingId(null);
    setFormData((prev) => ({
      ...prev,
      title: `${oferta.title} (copia)`,
      status: 'VIGENTE',
    }));
  };

  const handleTenantChange = (tenantId: string) => {
    const emp = empresas.find((e) => e.id === tenantId);
    setFormData((prev) => ({
      ...prev,
      tenantId,
      companyName: emp?.name || prev.companyName,
    }));
  };

  const buildPayload = () => ({
    title: formData.title.trim(),
    description: formData.description.trim(),
    perfilRequisitos: formData.perfilRequisitos.trim() || undefined,
    salary: Number(formData.salary),
    sector: formData.sector.trim(),
    vacancies: Number(formData.vacancies) || 1,
    status: formData.status as 'VIGENTE' | 'CULMINADO',
    tenantId: formData.tenantId || undefined,
    companyName: formData.companyName.trim() || undefined,
    tipoManoObra: formData.tipoManoObra,
    fechaInicioProyectada: formData.fechaInicioProyectada || undefined,
    fechaCierre: formData.fechaCierre || undefined,
    regimenLaboral: formData.regimenLaboral.trim() || undefined,
    tiempoContratoMeses: formData.tiempoContratoMeses
      ? Number(formData.tiempoContratoMeses)
      : undefined,
    horarioTrabajo: formData.horarioTrabajo.trim() || undefined,
    sistemaTrabajo: formData.sistemaTrabajo.trim() || undefined,
    notaAviso: formData.notaAviso.trim() || undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.sector || !formData.salary) {
      alert('Complete puesto, funciones, sector y sueldo.');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = buildPayload();
      let res;
      if (editingId) {
        res = await api.patch(`/ofertas/${editingId}`, payload);
      } else {
        res = await api.post('/ofertas', payload);
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData(EMPTY_FORM);
      fetchData();
      const n = res.data?.alertasEnviadas;
      if (typeof n === 'number' && n > 0) {
        alert(`Oferta guardada. Se enviaron ${n} alertas a comuneros/directiva.`);
      }
    } catch (err: any) {
      alert(`Error al guardar: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Culminar y archivar esta oferta?')) return;
    try {
      await api.delete(`/ofertas/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const tipoLabel = (value: string) =>
    TIPO_MANO_OBRA.find((t) => t.value === value)?.label || value;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Matriz de Ofertas Laborales</h1>
          <p className="text-slate-500">
            Registro y publicación de convocatorias (visible para toda la comunidad).
          </p>
        </div>
        {canWrite && (
          <button
            onClick={openCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Nueva oferta</span>
          </button>
        )}
      </div>

      <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900 flex items-start gap-2">
        <Bell className="w-4 h-4 mt-0.5 shrink-0" />
        <p>
          Al <strong>publicar</strong> una oferta vigente, el sistema genera una alerta para todos
          los comuneros registrados en la app.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por puesto, empresa, sector o tipo de mano de obra..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600 whitespace-nowrap">
            <input
              type="checkbox"
              checked={showCulminadas}
              onChange={(e) => setShowCulminadas(e.target.checked)}
            />
            Incluir culminadas
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1100px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Registro</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Puesto</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Empresa</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Tipo MO</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Vacantes</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Sueldo</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Régimen / Sistema</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Estado</th>
                {canWrite && (
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Acciones</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">Cargando matriz...</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-red-500 font-medium">
                    {error}
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                    No hay ofertas registradas.
                  </td>
                </tr>
              ) : (
                filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                      {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{o.title}</div>
                      <div className="text-xs text-slate-500">{o.sector}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">{o.company || o.companyName}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{tipoLabel(o.tipoManoObra)}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-800">{o.vacancies}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      S/ {Number(o.salary || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      <div>{o.regimenLaboral || '—'}</div>
                      <div>{o.sistemaTrabajo || o.horarioTrabajo || ''}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          o.status === 'VIGENTE'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {o.estadoLabel || o.status}
                      </span>
                    </td>
                    {canWrite && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEdit(o)}
                            className="p-2 text-slate-400 hover:text-blue-600 rounded-lg"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => duplicateFrom(o)}
                            className="p-2 text-slate-400 hover:text-blue-600 rounded-lg"
                            title="Copiar matriz / autocompletar"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(o.id)}
                            className="p-2 text-slate-400 hover:text-red-600 rounded-lg"
                            title="Culminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-slate-800">
                  {editingId ? 'Actualizar oferta' : 'Registrar oportunidad laboral'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
              <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">
                Matriz de datos (completar / copiar desde otra oferta)
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nombre del puesto *
                  </label>
                  <input
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Convocante / empresa
                  </label>
                  <select
                    value={formData.tenantId}
                    onChange={(e) => handleTenantChange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="">Seleccione...</option>
                    {empresas.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nombre empresa (texto)
                  </label>
                  <input
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tipo de mano de obra *
                  </label>
                  <select
                    required
                    value={formData.tipoManoObra}
                    onChange={(e) => setFormData({ ...formData, tipoManoObra: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    {TIPO_MANO_OBRA.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Estado convocatoria
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="VIGENTE">Vigente</option>
                    <option value="CULMINADO">Culminado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nro. de vacantes *
                  </label>
                  <input
                    required
                    type="number"
                    min={1}
                    value={formData.vacancies}
                    onChange={(e) => setFormData({ ...formData, vacancies: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Sueldo (S/) *</label>
                  <input
                    required
                    type="number"
                    min={0}
                    step="0.01"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Sector / ubicación *
                  </label>
                  <input
                    required
                    value={formData.sector}
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    placeholder="Ej. Minería / Huari"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Fecha inicio proyectado
                  </label>
                  <input
                    type="date"
                    value={formData.fechaInicioProyectada}
                    onChange={(e) =>
                      setFormData({ ...formData, fechaInicioProyectada: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Fecha cierre (vigencia / faltan X días)
                  </label>
                  <input
                    type="date"
                    value={formData.fechaCierre}
                    onChange={(e) => setFormData({ ...formData, fechaCierre: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Régimen laboral
                  </label>
                  <input
                    value={formData.regimenLaboral}
                    onChange={(e) => setFormData({ ...formData, regimenLaboral: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    placeholder="Ej. 728, 1057"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tiempo de contrato (meses)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.tiempoContratoMeses}
                    onChange={(e) =>
                      setFormData({ ...formData, tiempoContratoMeses: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Horario de trabajo
                  </label>
                  <input
                    value={formData.horarioTrabajo}
                    onChange={(e) => setFormData({ ...formData, horarioTrabajo: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Sistema de trabajo
                  </label>
                  <input
                    value={formData.sistemaTrabajo}
                    onChange={(e) => setFormData({ ...formData, sistemaTrabajo: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    placeholder="Ej. 14x7, 20x10"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Funciones *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg resize-y"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Perfil / requisitos
                  </label>
                  <textarea
                    rows={3}
                    value={formData.perfilRequisitos}
                    onChange={(e) => setFormData({ ...formData, perfilRequisitos: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg resize-y"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nota / aviso de publicación
                  </label>
                  <textarea
                    rows={2}
                    value={formData.notaAviso}
                    onChange={(e) => setFormData({ ...formData, notaAviso: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg resize-y"
                  />
                </div>
              </div>

              <div className="pt-2 flex space-x-3 sticky bottom-0 bg-white pb-1">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50 font-semibold"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : editingId ? (
                    'Guardar cambios'
                  ) : (
                    'Publicar oferta'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
