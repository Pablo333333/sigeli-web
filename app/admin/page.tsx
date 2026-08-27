'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import api from '@/services/api';
import {
  Users,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Briefcase,
  GraduationCap,
  CalendarDays,
} from 'lucide-react';

type NamedValue = { key: string; label: string; value: number };

function BarList({
  items,
  total,
  color = 'bg-blue-600',
}: {
  items: NamedValue[];
  total?: number;
  color?: string;
}) {
  const max = Math.max(...items.map((i) => i.value), 1);
  const denom = total && total > 0 ? total : max;
  if (!items.length) {
    return (
      <div className="h-32 flex items-center justify-center text-slate-400 italic bg-slate-50 rounded-lg text-sm">
        Sin datos para los filtros actuales.
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {items.map((item) => {
        const pct = (item.value / denom) * 100;
        return (
          <div key={item.key} className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-slate-700">{item.label}</span>
              <span className="text-slate-500">{item.value}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div className={`${color} h-2 rounded-full`} style={{ width: `${Math.min(pct, 100)}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MonthChart({
  data,
}: {
  data: Array<{ mes: number; label: string; total: number; activos?: number }>;
}) {
  const max = Math.max(...data.map((d) => d.total), 1);
  return (
    <div className="flex items-end gap-2 h-40">
      {data.map((d) => (
        <div key={d.mes} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
          <span className="text-[10px] font-semibold text-slate-600">{d.total || ''}</span>
          <div
            className="w-full rounded-t-md bg-blue-500/80 min-h-[2px]"
            style={{ height: `${(d.total / max) * 100}%` }}
            title={`${d.label}: ${d.total}`}
          />
          <span className="text-[10px] text-slate-400 uppercase">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    sector: '',
    gender: '',
    tipoManoObra: '',
    anio: String(new Date().getFullYear()),
    tenantId: '',
  });

  const fetchStats = async (f = filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (f.sector) params.set('sector', f.sector);
      if (f.gender) params.set('gender', f.gender);
      if (f.tipoManoObra) params.set('tipoManoObra', f.tipoManoObra);
      if (f.anio) params.set('anio', f.anio);
      if (f.tenantId) params.set('tenantId', f.tenantId);
      const qs = params.toString();
      const { data } = await api.get(`/analitica/dashboards${qs ? `?${qs}` : ''}`);
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const catalogo = stats?.catalogoFiltros;
  const interesados = stats?.interesados;

  const talentoBars: NamedValue[] = useMemo(() => {
    const t = stats?.clasificacionTalento;
    if (!t) return [];
    return [
      { key: 'profesional', label: 'Profesional', value: t.profesional || 0 },
      { key: 'tecnico', label: 'Técnico', value: t.tecnico || 0 },
      { key: 'calificado', label: 'Calificado', value: t.calificado || 0 },
      { key: 'semiCalificado', label: 'Semi calificado', value: t.semiCalificado || 0 },
      { key: 'noCalificado', label: 'No calificado', value: t.noCalificado || 0 },
    ];
  }, [stats]);

  const kpis = [
    {
      label: 'Personas interesadas',
      value: interesados?.total ?? stats?.totalComuneros ?? 0,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      trend: `${interesados?.varones ?? 0} ♂ / ${interesados?.mujeres ?? 0} ♀`,
      trendUp: true,
    },
    {
      label: 'Contratos activos',
      value: stats?.totalContratados || 0,
      icon: CheckCircle2,
      color: 'text-green-600',
      bg: 'bg-green-100',
      trend: stats?.tendencias?.cumplimiento || '—',
      trendUp: true,
    },
    {
      label: 'Convocatorias (año)',
      value: stats?.convocatorias?.total ?? 0,
      icon: Briefcase,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
      trend: `${stats?.convocatorias?.vigentes ?? 0} vigentes`,
      trendUp: true,
    },
    {
      label: 'Entrenamiento laboral',
      value: stats?.programaEntrenamiento?.participantes ?? 0,
      icon: GraduationCap,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
      trend: 'Participantes',
      trendUp: true,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard personalizado</h1>
          <p className="text-slate-500">
            Indicadores para Directiva Comunal y Empresa — filtros por sector, género, mano de obra y año.
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Última actualización</p>
          <p className="text-sm font-semibold text-slate-600">
            {stats ? new Date(stats.timestamp).toLocaleString() : '-'}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-3 text-slate-700 font-semibold text-sm">
          <Filter className="w-4 h-4" /> Filtros del dashboard
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <select
            value={filters.sector}
            onChange={(e) => setFilters({ ...filters, sector: e.target.value })}
            className="px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm"
          >
            <option value="">Todos los sectores</option>
            {(catalogo?.sectores || []).map((s: string) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            value={filters.gender}
            onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
            className="px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm"
          >
            <option value="">Todos los géneros</option>
            <option value="MASCULINO">Masculino</option>
            <option value="FEMENINO">Femenino</option>
            <option value="OTRO">Otro</option>
          </select>
          <select
            value={filters.tipoManoObra}
            onChange={(e) => setFilters({ ...filters, tipoManoObra: e.target.value })}
            className="px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm"
          >
            <option value="">Tipo mano de obra</option>
            {(catalogo?.tiposManoObra || []).map((t: any) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <select
            value={filters.anio}
            onChange={(e) => setFilters({ ...filters, anio: e.target.value })}
            className="px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm"
          >
            {(catalogo?.anios || [new Date().getFullYear()]).map((y: number) => (
              <option key={y} value={y}>
                Año {y}
              </option>
            ))}
          </select>
          <select
            value={filters.tenantId}
            onChange={(e) => setFilters({ ...filters, tenantId: e.target.value })}
            className="px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm"
          >
            <option value="">Todas las empresas</option>
            {(catalogo?.empresas || []).map((e: any) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-3 flex gap-2 justify-end">
          <button
            onClick={() => {
              const cleared = {
                sector: '',
                gender: '',
                tipoManoObra: '',
                anio: String(new Date().getFullYear()),
                tenantId: '',
              };
              setFilters(cleared);
              fetchStats(cleared);
            }}
            className="px-4 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
          >
            Limpiar
          </button>
          <button
            onClick={() => fetchStats()}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Aplicar filtros
          </button>
        </div>
      </div>

      {loading && !stats ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpis.map((kpi) => (
              <div
                key={kpi.label}
                className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-lg ${kpi.bg}`}>
                    <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
                  </div>
                  <div
                    className={`flex items-center text-xs font-medium ${
                      kpi.trendUp ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {kpi.trend}
                    {kpi.trendUp ? (
                      <ArrowUpRight className="w-3 h-3 ml-1" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 ml-1" />
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {loading ? '…' : kpi.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Comuneros por sector</h3>
              <BarList items={stats?.comunerosPorSector || []} color="bg-emerald-500" />
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Potencial de mano de obra por edad
              </h3>
              <BarList items={stats?.potencialPorEdad || []} color="bg-indigo-500" />
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Clasificación del talento local
              </h3>
              <BarList items={talentoBars} color="bg-violet-500" />
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Convocatorias por tipo de mano de obra
              </h3>
              <BarList items={stats?.manoObraRequerida || []} color="bg-amber-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <CalendarDays className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-slate-800">
                  Convocatorias por mes ({stats?.convocatorias?.anio})
                </h3>
              </div>
              <MonthChart data={stats?.convocatorias?.porMes || []} />
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-slate-800">
                  Contratos por mes ({stats?.contratos?.anio})
                </h3>
              </div>
              <MonthChart data={stats?.contratos?.porMes || []} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Contratos por tipo de mano de obra
              </h3>
              <BarList items={stats?.contratos?.porTipoManoObra || []} color="bg-sky-500" />
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Trabajaron en mina por año
              </h3>
              <BarList
                items={(stats?.trabajaronMinaPorAnio || []).map((x: any) => ({
                  key: String(x.anio),
                  label: String(x.anio),
                  value: x.value,
                }))}
                color="bg-rose-500"
              />
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800 mb-6">Estado de paz social</h3>
              <div
                className={`p-4 rounded-lg flex items-center gap-4 border mb-4 ${
                  stats?.pazSocial?.nivelConfianza === 'ÓPTIMO'
                    ? 'bg-green-50 border-green-100'
                    : stats?.pazSocial?.nivelConfianza === 'ADVERTENCIA'
                      ? 'bg-orange-50 border-orange-100'
                      : 'bg-red-50 border-red-100'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full animate-pulse ${
                    stats?.pazSocial?.nivelConfianza === 'ÓPTIMO'
                      ? 'bg-green-500'
                      : stats?.pazSocial?.nivelConfianza === 'ADVERTENCIA'
                        ? 'bg-orange-500'
                        : 'bg-red-500'
                  }`}
                />
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Confianza: {stats?.pazSocial?.nivelConfianza}
                  </p>
                  <p className="text-xs text-slate-600">
                    Cumplimiento acuerdos ~{stats?.pazSocial?.cumplimientoAcuerdos}%
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {(stats?.pazSocial?.alertas || []).map((alerta: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 p-3 rounded-lg border border-orange-100 bg-orange-50"
                  >
                    <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-orange-900">
                      <strong>{alerta.tipo}:</strong> {alerta.mensaje}
                    </p>
                  </div>
                ))}
                {(!stats?.pazSocial?.alertas || stats.pazSocial.alertas.length === 0) && (
                  <p className="text-xs text-slate-400 italic text-center py-2">Sin alertas críticas</p>
                )}
              </div>
              <Link
                href="/admin/transparencia"
                className="mt-4 w-full block text-center py-2.5 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg"
              >
                Ver transparencia
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
