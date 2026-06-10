'use client';

import React, { useEffect, useState } from 'react';
import api from '@/services/api';
import DataTable from '@/components/DataTable';
import { 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  MessageSquareWarning,
  RefreshCw
} from 'lucide-react';

interface Reclamo {
  id: string;
  motivo: string;
  estado: string;
  createdAt: string;
  user: { fullName: string; dni: string };
  tenant: { name: string };
}

interface Tenant {
  id: string;
  name: string;
  trustLevel: 'VERDE' | 'AMARILLO' | 'ROJO';
}

export default function TransparenciaPage() {
  const [reclamos, setReclamos] = useState<Reclamo[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingSemaforo, setUpdatingSemaforo] = useState(false);
  
  // Form state for Semaforo
  const [selectedTenant, setSelectedTenant] = useState('');
  const [newLevel, setNewLevel] = useState<'VERDE' | 'AMARILLO' | 'ROJO'>('VERDE');
  const [justificacion, setJustificacion] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reclamosRes, estadoRes] = await Promise.all([
        api.get('/transparencia/reclamos'),
        api.get('/transparencia/estado')
      ]);
      setReclamos(reclamosRes.data);
      // Extraemos los tenants del estado de transparencia
      setTenants(estadoRes.data.semaforos.map((t: any, index: number) => ({
        id: t.id || `tenant-${index}`, // Usamos ID si existe o fallback
        name: t.name,
        trustLevel: t.trustLevel
      })));
    } catch (error) {
      console.error('Error fetching transparency data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleResolveReclamo = async (id: string) => {
    try {
      await api.patch(`/transparencia/reclamos/${id}/estado`, { estado: 'RESUELTO' });
      fetchData(); // Recargar datos
    } catch (error) {
      alert('Error al resolver el reclamo');
    }
  };

  const handleUpdateSemaforo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant || !justificacion) {
      alert('Por favor completa todos los campos');
      return;
    }

    setUpdatingSemaforo(true);
    try {
      // Nota: En una implementación real, buscaríamos el ID real del tenant
      // Aquí usamos el nombre como ID para el ejemplo si el ID no está disponible
      const tenant = tenants.find(t => t.name === selectedTenant);
      if (!tenant) return;

      await api.patch(`/transparencia/semaforo/${tenant.id}`, {
        nivel: newLevel,
        justificacion
      });
      
      alert('Semáforo actualizado correctamente');
      setJustificacion('');
      fetchData();
    } catch (error) {
      alert('Error al actualizar el semáforo');
    } finally {
      setUpdatingSemaforo(false);
    }
  };

  const columns = [
    { header: 'Comunero', accessor: (item: Reclamo) => item.user.fullName },
    { header: 'Empresa/Comunidad', accessor: (item: Reclamo) => item.tenant.name },
    { header: 'Motivo', accessor: 'motivo' as keyof Reclamo },
    { 
      header: 'Estado', 
      accessor: (item: Reclamo) => (
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
          item.estado === 'PENDIENTE' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
        }`}>
          {item.estado}
        </span>
      )
    },
    { 
      header: 'Acciones', 
      accessor: (item: Reclamo) => (
        item.estado === 'PENDIENTE' && (
          <button 
            onClick={() => handleResolveReclamo(item.id)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
          >
            <CheckCircle2 className="w-4 h-4 mr-1" /> Resolver
          </button>
        )
      )
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestión de Transparencia</h1>
          <p className="text-slate-500">Monitoreo de conflictos y semáforo de confianza comunal.</p>
        </div>
        <button 
          onClick={fetchData}
          className="flex items-center space-x-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tabla de Reclamos */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center space-x-2 text-slate-800 font-semibold mb-2">
            <MessageSquareWarning className="w-5 h-5 text-orange-500" />
            <h3>Reclamos y Conflictos</h3>
          </div>
          <DataTable columns={columns} data={reclamos} loading={loading} />
        </div>

        {/* Gestor de Semáforo */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-slate-800 font-semibold mb-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <h3>Gestor de Semáforo</h3>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <form onSubmit={handleUpdateSemaforo} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Seleccionar Entidad</label>
                <select 
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={selectedTenant}
                  onChange={(e) => setSelectedTenant(e.target.value)}
                >
                  <option value="">Seleccione una empresa/comunidad</option>
                  {tenants.map(t => (
                    <option key={t.id} value={t.name}>{t.name} ({t.trustLevel})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nuevo Nivel de Confianza</label>
                <div className="flex space-x-2">
                  {(['VERDE', 'AMARILLO', 'ROJO'] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setNewLevel(level)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                        newLevel === level 
                          ? level === 'VERDE' ? 'bg-green-500 border-green-600 text-white' :
                            level === 'AMARILLO' ? 'bg-yellow-500 border-yellow-600 text-white' :
                            'bg-red-500 border-red-600 text-white'
                          : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Justificación del Cambio</label>
                <textarea 
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm h-24 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Explique el motivo del cambio de estado..."
                  value={justificacion}
                  onChange={(e) => setJustificacion(e.target.value)}
                />
              </div>

              <button 
                type="submit"
                disabled={updatingSemaforo}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {updatingSemaforo ? 'Actualizando...' : 'Actualizar Semáforo'}
              </button>
            </form>
          </div>

          {/* Resumen de Estados Actuales */}
          <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-300">
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Estados Actuales</h4>
            <div className="space-y-2">
              {tenants.map(t => (
                <div key={t.id} className="flex justify-between items-center bg-white p-2 rounded border border-slate-100">
                  <span className="text-sm text-slate-700">{t.name}</span>
                  <div className={`w-3 h-3 rounded-full ${
                    t.trustLevel === 'VERDE' ? 'bg-green-500' :
                    t.trustLevel === 'AMARILLO' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
