'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import api from '@/services/api';
import { MapPinned, Flame, Users, Briefcase, UserCheck } from 'lucide-react';

const HeatmapMap = dynamic(() => import('./HeatmapMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[520px] w-full rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400">
      Cargando mapa…
    </div>
  ),
});

type Capa = 'todos' | 'ofertas' | 'comuneros' | 'postulantes';

const CAPAS: Array<{ id: Capa; label: string; icon: any }> = [
  { id: 'todos', label: 'Vista combinada', icon: Flame },
  { id: 'ofertas', label: 'Ofertas laborales', icon: Briefcase },
  { id: 'comuneros', label: 'Comuneros', icon: Users },
  { id: 'postulantes', label: 'Postulantes', icon: UserCheck },
];

export default function MapasCalorPage() {
  const [capa, setCapa] = useState<Capa>('todos');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async (c: Capa = capa) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/analitica/heatmap?capa=${c}`);
      setData(res.data);
    } catch (e: any) {
      console.error(e);
      setError(e?.response?.data?.message || 'No se pudo cargar el mapa de calor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(capa);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [capa]);

  const ranking = (data?.puntos || []).filter((p: any) => p.peso > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-700 mb-1">
            <MapPinned className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Georreferencia</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Mapas de calor</h1>
          <p className="text-slate-500">
            Concentración de ofertas, comuneros y postulantes por centro poblado (lat/lng).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {CAPAS.map((c) => {
            const Icon = c.icon;
            const active = capa === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setCapa(c.id)}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                  active
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Ofertas', value: data?.totales?.ofertas ?? '—' },
          { label: 'Comuneros', value: data?.totales?.comuneros ?? '—' },
          { label: 'Postulantes', value: data?.totales?.postulantes ?? '—' },
          { label: 'Sectores con dato', value: data?.totales?.sectoresConDato ?? '—' },
        ].map((k) => (
          <div key={k.label} className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs text-slate-500 font-medium uppercase">{k.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{loading ? '…' : k.value}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          {data?.centro ? (
            <HeatmapMap
              puntos={data.puntos || []}
              centro={data.centro}
              zoom={data.zoom || 9}
            />
          ) : (
            <div className="h-[520px] flex items-center justify-center text-slate-400">
              {loading ? 'Cargando…' : 'Sin datos de mapa'}
            </div>
          )}
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-blue-600" /> Baja
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-yellow-600" /> Media
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-orange-600" /> Alta
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-700" /> Muy alta
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-3">Ranking por intensidad</h3>
          {loading && !data ? (
            <p className="text-sm text-slate-400">Cargando…</p>
          ) : ranking.length === 0 ? (
            <p className="text-sm text-slate-400 italic">Sin concentraciones para esta capa.</p>
          ) : (
            <ul className="space-y-3">
              {ranking.map((p: any) => (
                <li key={p.sectorId}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700">{p.nombre}</span>
                    <span className="text-slate-500">{p.peso}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-red-600"
                      style={{ width: `${Math.max(8, p.intensidad * 100)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    O:{p.ofertas} · C:{p.comuneros} · P:{p.postulantes}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
