'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import api from '@/services/api';
import {
  FileText,
  Search,
  Loader2,
  X,
  Plus,
  Pencil,
  Building2,
  User,
} from 'lucide-react';

const TIPO_MANO_OBRA = [
  { value: 'NO_CALIFICADA', label: 'No calificada' },
  { value: 'SEMI_CALIFICADA', label: 'Semi calificada' },
  { value: 'CALIFICADA', label: 'Calificada' },
  { value: 'PROFESIONAL', label: 'Profesional' },
  { value: 'TECNICO', label: 'Técnico' },
  { value: 'PRACTICAS', label: 'Prácticas' },
];

const EMPTY_FORM = {
  postulacionId: '',
  numeroContrato: '',
  companyName: '',
  puesto: '',
  cargo: '',
  area: '',
  sector: '',
  tipoManoObra: 'NO_CALIFICADA',
  startDate: '',
  endDate: '',
  salary: '',
  regimenLaboral: '728',
  tiempoContratoMeses: '6',
  horarioTrabajo: '',
  sistemaTrabajo: '',
  observaciones: '',
};

type FormState = typeof EMPTY_FORM;

export default function ContratosPage() {
  const [contratos, setContratos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [dni, setDni] = useState('');
  const [nombre, setNombre] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [prefillInfo, setPrefillInfo] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingPrefill, setLoadingPrefill] = useState(false);
  const [userRole, setUserRole] = useState('ADMIN');

  const canWrite = userRole === 'ADMIN' || userRole === 'EMPRESA';

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('sigeli_user') || '{}');
      setUserRole(u.role || 'ADMIN');
    } catch {
      /* ignore */
    }
  }, []);

  const fetchContratos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (q.trim()) params.q = q.trim();
      if (dni.trim()) params.dni = dni.trim();
      if (nombre.trim()) params.nombre = nombre.trim();
      if (empresa.trim()) params.empresa = empresa.trim();
      const res = await api.get('/contratos', { params });
      setContratos(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [q, dni, nombre, empresa]);

  useEffect(() => {
    fetchContratos();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setPrefillInfo(null);
    setShowModal(true);
  };

  const openEdit = (c: any) => {
    setEditingId(c.id);
    setPrefillInfo({
      comunero: c.user,
      yaTieneContrato: true,
    });
    setForm({
      postulacionId: c.postulacionId || '',
      numeroContrato: c.numeroContrato || '',
      companyName: c.companyName || c.postulacion?.oferta?.companyName || '',
      puesto: c.puesto || c.postulacion?.oferta?.title || '',
      cargo: c.cargo || '',
      area: c.area || '',
      sector: c.sector || '',
      tipoManoObra: c.tipoManoObra || 'NO_CALIFICADA',
      startDate: c.startDate ? new Date(c.startDate).toISOString().slice(0, 10) : '',
      endDate: c.endDate ? new Date(c.endDate).toISOString().slice(0, 10) : '',
      salary: c.salary != null ? String(c.salary) : '',
      regimenLaboral: c.regimenLaboral || '728',
      tiempoContratoMeses: c.tiempoContratoMeses != null ? String(c.tiempoContratoMeses) : '',
      horarioTrabajo: c.horarioTrabajo || '',
      sistemaTrabajo: c.sistemaTrabajo || '',
      observaciones: c.observaciones || '',
    });
    setShowModal(true);
  };

  const loadPrefill = async () => {
    if (!form.postulacionId.trim()) {
      alert('Indique el ID de la postulación.');
      return;
    }
    setLoadingPrefill(true);
    try {
      const { data } = await api.get(`/contratos/prefill/${form.postulacionId.trim()}`);
      setPrefillInfo(data);
      if (data.yaTieneContrato) {
        alert('Esta postulación ya tiene contrato. Puede editarlo desde la lista.');
      }
      const m = data.matriz || {};
      setForm((f) => ({
        ...f,
        numeroContrato: m.numeroContrato || '',
        companyName: m.companyName || '',
        puesto: m.puesto || '',
        cargo: m.cargo || '',
        area: m.area || '',
        sector: m.sector || '',
        tipoManoObra: m.tipoManoObra || 'NO_CALIFICADA',
        startDate: m.startDate || '',
        endDate: m.endDate || '',
        salary: m.salary != null ? String(m.salary) : '',
        regimenLaboral: m.regimenLaboral || '728',
        tiempoContratoMeses: m.tiempoContratoMeses != null ? String(m.tiempoContratoMeses) : '6',
        horarioTrabajo: m.horarioTrabajo || '',
        sistemaTrabajo: m.sistemaTrabajo || '',
        observaciones: m.observaciones || '',
      }));
    } catch (err: any) {
      alert(err.response?.data?.message || 'No se pudo cargar el prefill.');
    } finally {
      setLoadingPrefill(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        numeroContrato: form.numeroContrato || undefined,
        companyName: form.companyName || undefined,
        puesto: form.puesto || undefined,
        cargo: form.cargo || undefined,
        area: form.area || undefined,
        sector: form.sector || undefined,
        tipoManoObra: form.tipoManoObra || undefined,
        startDate: form.startDate,
        endDate: form.endDate,
        salary: Number(form.salary),
        regimenLaboral: form.regimenLaboral || undefined,
        tiempoContratoMeses: form.tiempoContratoMeses
          ? Number(form.tiempoContratoMeses)
          : undefined,
        horarioTrabajo: form.horarioTrabajo || undefined,
        sistemaTrabajo: form.sistemaTrabajo || undefined,
        observaciones: form.observaciones || undefined,
      };

      if (editingId) {
        await api.patch(`/contratos/${editingId}`, payload);
      } else {
        if (!form.postulacionId) {
          alert('Se requiere postulacionId para crear el contrato.');
          setSubmitting(false);
          return;
        }
        await api.post('/contratos', {
          ...payload,
          postulacionId: form.postulacionId.trim(),
        });
      }
      setShowModal(false);
      await fetchContratos();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al guardar el contrato.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredHint = useMemo(() => {
    const parts = [q && `q=${q}`, dni && `DNI`, nombre && `nombre`, empresa && `empresa`].filter(
      Boolean,
    );
    return parts.length ? `Filtro: ${parts.join(', ')}` : 'Sin filtros';
  }, [q, dni, nombre, empresa]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Matriz de contratos</h1>
          <p className="text-slate-500">
            Formalización y búsqueda por DNI, nombre del comunero y empresa.
          </p>
        </div>
        {canWrite && (
          <button
            onClick={openCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Formalizar contrato
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
              placeholder="Buscar general…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <input
            className="w-full px-3 py-2 border rounded-lg text-sm"
            placeholder="DNI"
            value={dni}
            onChange={(e) => setDni(e.target.value.replace(/\D/g, '').slice(0, 8))}
          />
          <input
            className="w-full px-3 py-2 border rounded-lg text-sm"
            placeholder="Nombre comunero"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <input
            className="w-full px-3 py-2 border rounded-lg text-sm"
            placeholder="Empresa"
            value={empresa}
            onChange={(e) => setEmpresa(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500">{filteredHint}</p>
          <button
            onClick={fetchContratos}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold"
          >
            Buscar
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-500">Comunero</th>
                <th className="px-4 py-3 font-semibold text-slate-500">Empresa / Puesto</th>
                <th className="px-4 py-3 font-semibold text-slate-500">Régimen</th>
                <th className="px-4 py-3 font-semibold text-slate-500">Vigencia</th>
                <th className="px-4 py-3 font-semibold text-slate-500">Estado</th>
                <th className="px-4 py-3 font-semibold text-slate-500">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : contratos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-slate-500">
                    No hay contratos con esos criterios.
                  </td>
                </tr>
              ) : (
                contratos.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{c.user?.fullName}</div>
                      <div className="text-xs text-slate-500">
                        DNI {c.user?.dni}
                        {c.comuneroEdad != null ? ` · ${c.comuneroEdad} años` : ''}
                        {c.comuneroSexo ? ` · ${c.comuneroSexo}` : ''}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">
                        {c.companyName || c.postulacion?.oferta?.companyName || '—'}
                      </div>
                      <div className="text-xs text-slate-500">
                        {c.puesto || c.postulacion?.oferta?.title || '—'}
                      </div>
                    </td>
                    <td className="px-4 py-3">{c.regimenLaboral || '—'}</td>
                    <td className="px-4 py-3 text-xs">
                      {c.startDate ? new Date(c.startDate).toLocaleDateString() : '—'} →{' '}
                      {c.endDate ? new Date(c.endDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold px-2 py-1 rounded-full bg-green-50 text-green-700">
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {canWrite && (
                        <button
                          onClick={() => openEdit(c)}
                          className="p-2 hover:bg-slate-100 rounded-lg"
                          title="Editar matriz"
                        >
                          <Pencil className="w-4 h-4 text-slate-600" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                {editingId ? 'Editar contrato (matriz)' : 'Formalizar contrato'}
              </h2>
              <button onClick={() => setShowModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {!editingId && (
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">ID postulación</label>
                    <input
                      required
                      className="w-full px-3 py-2 border rounded-lg"
                      value={form.postulacionId}
                      onChange={(e) => setForm({ ...form, postulacionId: e.target.value })}
                      placeholder="UUID de la postulación"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={loadPrefill}
                    disabled={loadingPrefill}
                    className="px-4 py-2 border rounded-lg text-sm font-semibold"
                  >
                    {loadingPrefill ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Autocompletar'
                    )}
                  </button>
                </div>
              )}

              {prefillInfo?.comunero && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm space-y-2">
                  <div className="flex gap-3 items-start">
                    <User className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-bold text-slate-800 text-base">
                        {prefillInfo.comunero.fullName}
                      </div>
                      <div className="text-slate-600">DNI {prefillInfo.comunero.dni}</div>
                    </div>
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-blue-100">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-blue-600 tracking-wide">
                        Edad
                      </p>
                      <p className="font-semibold text-slate-800">
                        {prefillInfo.comunero.edad != null
                          ? `${prefillInfo.comunero.edad} años`
                          : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase text-blue-600 tracking-wide">
                        Sexo
                      </p>
                      <p className="font-semibold text-slate-800">
                        {prefillInfo.comunero.sexo || '—'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Nº contrato</label>
                  <input
                    className="w-full px-3 py-2 border rounded-lg"
                    value={form.numeroContrato}
                    onChange={(e) => setForm({ ...form, numeroContrato: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Empresa</label>
                  <input
                    className="w-full px-3 py-2 border rounded-lg"
                    value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Puesto</label>
                  <input
                    className="w-full px-3 py-2 border rounded-lg"
                    value={form.puesto}
                    onChange={(e) => setForm({ ...form, puesto: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Cargo</label>
                  <input
                    className="w-full px-3 py-2 border rounded-lg"
                    value={form.cargo}
                    onChange={(e) => setForm({ ...form, cargo: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Área</label>
                  <input
                    className="w-full px-3 py-2 border rounded-lg"
                    value={form.area}
                    onChange={(e) => setForm({ ...form, area: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Sector / ubicación</label>
                  <input
                    className="w-full px-3 py-2 border rounded-lg"
                    value={form.sector}
                    onChange={(e) => setForm({ ...form, sector: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo mano de obra</label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                    value={form.tipoManoObra}
                    onChange={(e) => setForm({ ...form, tipoManoObra: e.target.value })}
                  >
                    {TIPO_MANO_OBRA.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Régimen laboral</label>
                  <input
                    className="w-full px-3 py-2 border rounded-lg"
                    value={form.regimenLaboral}
                    onChange={(e) => setForm({ ...form, regimenLaboral: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Inicio</label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 border rounded-lg"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Fin</label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 border rounded-lg"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Sueldo</label>
                  <input
                    type="number"
                    required
                    min={0}
                    className="w-full px-3 py-2 border rounded-lg"
                    value={form.salary}
                    onChange={(e) => setForm({ ...form, salary: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Meses de contrato</label>
                  <input
                    type="number"
                    min={1}
                    className="w-full px-3 py-2 border rounded-lg"
                    value={form.tiempoContratoMeses}
                    onChange={(e) => setForm({ ...form, tiempoContratoMeses: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Horario</label>
                  <input
                    className="w-full px-3 py-2 border rounded-lg"
                    value={form.horarioTrabajo}
                    onChange={(e) => setForm({ ...form, horarioTrabajo: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Sistema de trabajo</label>
                  <input
                    className="w-full px-3 py-2 border rounded-lg"
                    value={form.sistemaTrabajo}
                    onChange={(e) => setForm({ ...form, sistemaTrabajo: e.target.value })}
                    placeholder="Ej. 14x7"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Observaciones</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-lg h-20 resize-none"
                  value={form.observaciones}
                  onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border rounded-lg py-2"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 text-white rounded-lg py-2 font-bold disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : editingId ? (
                    'Guardar cambios'
                  ) : (
                    'Formalizar'
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
