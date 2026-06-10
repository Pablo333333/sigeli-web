'use client';

import React, { useEffect, useState } from 'react';
import api from '@/services/api';
import { 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface DashboardStats {
  totalContratados: number;
  rotacionLaboral: number;
  cumplimientoLocal: number;
  totalComuneros: number;
  participacionFemenina: number;
  timestamp: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/analitica/dashboards');
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const kpis = [
    {
      label: 'Comuneros Contratados',
      value: stats?.totalContratados || 0,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      trend: '+12%',
      trendUp: true,
    },
    {
      label: 'Cumplimiento Local',
      value: `${stats?.cumplimientoLocal || 0}%`,
      icon: CheckCircle2,
      color: 'text-green-600',
      bg: 'bg-green-100',
      trend: 'En meta',
      trendUp: true,
    },
    {
      label: 'Rotación Laboral',
      value: `${stats?.rotacionLaboral || 0}%`,
      icon: TrendingUp,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
      trend: '-2%',
      trendUp: false,
    },
    {
      label: 'Participación Femenina',
      value: `${stats?.participacionFemenina || 0}%`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
      trend: 'Meta: 40%',
      trendUp: true,
    },
    {
      label: 'Total Comuneros',
      value: stats?.totalComuneros || 0,
      icon: Users,
      color: 'text-slate-600',
      bg: 'bg-slate-100',
      trend: 'Censo 2026',
      trendUp: true,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Panel de Control Estratégico</h1>
        <p className="text-slate-500">Monitoreo en tiempo real del impacto económico y paz social.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-lg ${kpi.bg}`}>
                <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
              </div>
              <div className={`flex items-center text-xs font-medium ${kpi.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                {kpi.trend}
                {kpi.trendUp ? <ArrowUpRight className="w-3 h-3 ml-1" /> : <ArrowDownRight className="w-3 h-3 ml-1" />}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Dashboard Content Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Distribución por Sector</h3>
          <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 italic">
            Gráfico de sectores (Chart.js / Recharts)
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Últimos Reclamos Registrados</h3>
          <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 italic">
            Lista de actividad reciente
          </div>
        </div>
      </div>
    </div>
  );
}
