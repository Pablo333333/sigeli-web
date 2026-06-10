'use client';

import React, { useEffect, useState } from 'react';
import api from '@/services/api';
import DataTable from '@/components/DataTable';
import { 
  FileText, 
  Plus, 
  CheckCircle2, 
  Clock,
  Users,
  Calendar,
  ExternalLink
} from 'lucide-react';

interface Acuerdo {
  id: string;
  titulo: string;
  descripcion: string;
  fechaFirma: string;
  fechaCumplimiento: string | null;
  estado: 'PENDIENTE' | 'CUMPLIDO';
  documentoUrl: string | null;
  partesInvolucradas: string[];
}

export default function GobernanzaPage() {
  const [acuerdos, setAcuerdos] = useState<Acuerdo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    fechaFirma: new Date().toISOString().split('T')[0],
    partesInvolucradas: '',
  });

  const fetchAcuerdos = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/gobernanza/acuerdos');
      setAcuerdos(data);
    } catch (error) {
      console.error('Error fetching acuerdos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAcuerdos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/gobernanza/acuerdos', {
        ...formData,
        partesInvolucradas: formData.partesInvolucradas.split(',').map(s => s.trim()),
      });
      setShowForm(false);
      setFormData({
        titulo: '',
        descripcion: '',
        fechaFirma: new Date().toISOString().split('T')[0],
        partesInvolucradas: '',
      });
      fetchAcuerdos();
    } catch (error) {
      alert('Error al crear acuerdo');
    }
  };

  const handleComplete = async (id: string) => {
    const url = prompt('Ingrese la URL del acta escaneada (opcional):');
    try {
      await api.patch(`/gobernanza/acuerdos/${id}/estado`, {
        estado: 'CUMPLIDO',
        documentoUrl: url || undefined,
      });
      fetchAcuerdos();
    } catch (error) {
      alert('Error al actualizar acuerdo');
    }
  };

  const columns = [
    { header: 'Título', accessor: 'titulo' as keyof Acuerdo },
    { 
      header: 'Fecha Firma', 
      accessor: (item: Acuerdo) => new Date(item.fechaFirma).toLocaleDateString() 
    },
    { 
      header: 'Partes', 
      accessor: (item: Acuerdo) => item.partesInvolucradas.join(', ') 
    },
    { 
      header: 'Estado', 
      accessor: (item: Acuerdo) => (
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
          item.estado === 'PENDIENTE' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
        }`}>
          {item.estado}
        </span>
      )
    },
    { 
      header: 'Acciones', 
      accessor: (item: Acuerdo) => (
        <div className="flex space-x-3">
          {item.estado === 'PENDIENTE' && (
            <button 
              onClick={() => handleComplete(item.id)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
            >
              <CheckCircle2 className="w-4 h-4 mr-1" /> Cumplir
            </button>
          )}
          {item.documentoUrl && (
            <a 
              href={item.documentoUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-600 hover:text-slate-800 text-sm font-medium flex items-center"
            >
              <ExternalLink className="w-4 h-4 mr-1" /> Ver Acta
            </a>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Registro de Acuerdos y Actas</h1>
          <p className="text-slate-500">Gestión de compromisos entre la empresa y la comunidad.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Acuerdo</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Registrar Nuevo Compromiso</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Título del Acuerdo</label>
              <input 
                type="text"
                required
                className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.titulo}
                onChange={(e) => setFormData({...formData, titulo: e.target.value})}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Descripción / Detalles</label>
              <textarea 
                required
                className="w-full border border-slate-200 rounded-lg p-2 text-sm h-24 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Firma</label>
              <input 
                type="date"
                required
                className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.fechaFirma}
                onChange={(e) => setFormData({...formData, fechaFirma: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Partes Involucradas (separadas por coma)</label>
              <input 
                type="text"
                required
                placeholder="Ej: Comunidad de Sigeli, Empresa Minera X"
                className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.partesInvolucradas}
                onChange={(e) => setFormData({...formData, partesInvolucradas: e.target.value})}
              />
            </div>
            <div className="md:col-span-2 flex justify-end space-x-3 mt-2">
              <button 
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Guardar Acuerdo
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-slate-800 font-semibold">
          <FileText className="w-5 h-5 text-blue-600" />
          <h3>Historial de Compromisos</h3>
        </div>
        <DataTable columns={columns} data={acuerdos} loading={loading} />
      </div>
    </div>
  );
}
