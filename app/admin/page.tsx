'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
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
  empleoPorSector: Record<string, number>;
  pazSocial: {
    nivelConfianza: string;
    cumplimientoAcuerdos: number;
    alertas: Array<{
      tipo: string;
      mensaje: string;
      color: string;
    }>;
  };
  tendencias: {
    contratados: string;
    cumplimiento: string;
    rotacion: string;
    femenina: string;
  };
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
      trend: stats?.tendencias.contratados || '0%',
      trendUp: true,
    },
    {
      label: 'Cumplimiento Local',
      value: `${stats?.cumplimientoLocal || 0}%`,
      icon: CheckCircle2,
      color: 'text-green-600',
      bg: 'bg-green-100',
      trend: stats?.tendencias.cumplimiento || 'En meta',
      trendUp: true,
    },
    {
      label: 'Rotación Laboral',
      value: `${stats?.rotacionLaboral || 0}%`,
      icon: TrendingUp,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
      trend: stats?.tendencias.rotacion || '0%',
      trendUp: false,
    },
    {
      label: 'Participación Femenina',
      value: `${stats?.participacionFemenina || 0}%`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
      trend: stats?.tendencias.femenina || 'Meta: 40%',
      trendUp: true,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Panel de Control Estratégico</h1>
          <p className="text-slate-500">Monitoreo en tiempo real del impacto económico y paz social.</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Última actualización</p>
          <p className="text-sm font-semibold text-slate-600">{stats ? new Date(stats.timestamp).toLocaleString() : '-'}</p>
        </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Distribución por Sector */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-800">Empleo Activo por Sector Geográfico</h3>
            <span className="text-xs font-medium bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full">En tiempo real</span>
          </div>
          
          <div className="space-y-4">
            {stats?.empleoPorSector && Object.entries(stats.empleoPorSector).length > 0 ? (
              Object.entries(stats.empleoPorSector).map(([sector, count]) => {
                const percentage = stats.totalContratados > 0 ? (count / stats.totalContratados) * 100 : 0;
                return (
                  <div key={sector} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-slate-700">{sector}</span>
                      <span className="text-slate-500">{count} trabajadores ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-400 italic bg-slate-50 rounded-lg">
                No hay datos de empleo por sector disponibles.
              </div>
            )}
          </div>
        </div>

        {/* Semáforo de Confianza / Alertas Rápidas */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Estado de Paz Social</h3>
          
          <div className="space-y-6">
            <div className={`p-4 rounded-lg flex items-center gap-4 border ${
              stats?.pazSocial.nivelConfianza === 'ÓPTIMO' ? 'bg-green-50 border-green-100' :
              stats?.pazSocial.nivelConfianza === 'ADVERTENCIA' ? 'bg-orange-50 border-orange-100' :
              'bg-red-50 border-red-100'
            }`}>
              <div className={`w-4 h-4 rounded-full animate-pulse ${
                stats?.pazSocial.nivelConfianza === 'ÓPTIMO' ? 'bg-green-500' :
                stats?.pazSocial.nivelConfianza === 'ADVERTENCIA' ? 'bg-orange-500' :
                'bg-red-500'
              }`}></div>
              <div>
                <p className={`text-sm font-bold ${
                  stats?.pazSocial.nivelConfianza === 'ÓPTIMO' ? 'text-green-800' :
                  stats?.pazSocial.nivelConfianza === 'ADVERTENCIA' ? 'text-orange-800' :
                  'text-red-800'
                }`}>Nivel de Confianza: {stats?.pazSocial.nivelConfianza}</p>
                <p className={`text-xs ${
                  stats?.pazSocial.nivelConfianza === 'ÓPTIMO' ? 'text-green-700' :
                  stats?.pazSocial.nivelConfianza === 'ADVERTENCIA' ? 'text-orange-700' :
                  'text-red-700'
                }`}>
                  {stats?.pazSocial.nivelConfianza === 'ÓPTIMO' ? `Cumplimiento de acuerdos al ${stats?.pazSocial.cumplimientoAcuerdos}%` :
                   stats?.pazSocial.nivelConfianza === 'ADVERTENCIA' ? 'Revisión de acuerdos en proceso' :
                   'Intervención requerida en acuerdos'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-400 uppercase">Alertas Críticas</p>
              {stats?.pazSocial.alertas && stats.pazSocial.alertas.length > 0 ? (
                stats.pazSocial.alertas.map((alerta, idx) => (
                  <div key={idx} className={`flex items-start gap-3 p-3 rounded-lg border ${
                    alerta.color === 'red' ? 'bg-red-50 border-red-100' : 'bg-orange-50 border-orange-100'
                  }`}>
                    <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${
                      alerta.color === 'red' ? 'text-red-500' : 'text-orange-500'
                    }`} />
                    <p className={`text-xs ${
                      alerta.color === 'red' ? 'text-red-800' : 'text-orange-800'
                    }`}>
                      <span className="font-bold">{alerta.tipo}:</span> {alerta.mensaje}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-500 italic text-center">
                  No hay alertas críticas activas.
                </div>
              )}
            </div>

            <Link 
              href="/admin/transparencia"
              className="w-full block text-center py-2.5 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              Ver Reporte de Transparencia
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
