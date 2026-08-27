'use client';

import React, { useEffect, useState } from 'react';
import api from '@/services/api';
import { 
  Users, 
  Search, 
  Download, 
  UserPlus, 
  MoreVertical,
  Mail,
  FileText,
  ShieldCheck,
  MapPin,
  Loader2,
  X,
  Sparkles,
  Eye,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function ComunerosPage() {
  const [cvs, setCvs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedCv, setSelectedCv] = useState<any>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    dni: '',
    sector: '',
    yearsExperience: 0,
    especialidad: '',
    aiSummary: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingIA, setIsGeneratingIA] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [query, setQuery] = useState('');
  const [dniFilter, setDniFilter] = useState('');
  const [empresaFilter, setEmpresaFilter] = useState('');
  const [dniCheck, setDniCheck] = useState<{ disponible?: boolean; mensaje?: string } | null>(null);

  const [trabajoMina, setTrabajoMina] = useState(false);

  const fetchCvs = async (filters?: {
    q?: string;
    dni?: string;
    empresa?: string;
    trabajoMina?: boolean;
  }) => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      const q = filters?.q ?? query;
      const dni = filters?.dni ?? dniFilter;
      const empresa = filters?.empresa ?? empresaFilter;
      const mina = filters?.trabajoMina ?? trabajoMina;
      if (q.trim()) params.q = q.trim();
      if (dni.trim()) params.dni = dni.trim();
      if (empresa.trim()) params.empresa = empresa.trim();
      if (mina) params.trabajoMina = '1';
      const response = await api.get('/cv', { params });
      setCvs(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching CVs:', err);
      setError(`Error: ${err.message} | Código: ${err.code || 'Desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCvs();
  }, []);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await api.get('/analitica/export/comuneros', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `padron-comuneros-talento-${new Date().getTime()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Error al exportar los datos.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleViewProfile = (cv: any) => {
    setSelectedCv(cv);
    setIsViewModalOpen(true);
  };

  const handleGenerateIA = async () => {
    if (!formData.especialidad || formData.yearsExperience <= 0) return;
    
    setIsGeneratingIA(true);
    try {
      const response = await api.post('/ia/generar-resumen', {
        especialidad: formData.especialidad,
        experiencia: formData.yearsExperience
      });
      setFormData({ ...formData, aiSummary: response.data.resumen });
    } catch (err: any) {
      alert('Error al generar el perfil con IA. Intente nuevamente.');
    } finally {
      setIsGeneratingIA(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.aiSummary) {
      alert('Por favor, genera primero el resumen con IA.');
      return;
    }

    setIsSubmitting(true);
    setDniCheck(null);
    try {
      const dniDigits = formData.dni.replace(/\D/g, '');
      if (dniDigits.length !== 8) {
        alert('El DNI debe tener exactamente 8 dígitos.');
        setIsSubmitting(false);
        return;
      }

      const check = await api.get(`/cv/check-dni/${dniDigits}`);
      if (check.data && check.data.disponible === false) {
        setDniCheck(check.data);
        alert(check.data.mensaje);
        setIsSubmitting(false);
        return;
      }

      const response = await api.post('/cv/registro', {
        fullName: formData.fullName,
        dni: dniDigits,
        sector: formData.sector,
        specialty: formData.especialidad,
        yearsExperience: Number(formData.yearsExperience),
        aiSummary: formData.aiSummary
      });

      if (response.status === 201 || response.status === 200) {
        setIsModalOpen(false);
        setFormData({ 
          fullName: '',
          dni: '',
          sector: '',
          yearsExperience: 0, 
          especialidad: '', 
          aiSummary: '' 
        });
        setDniCheck(null);
        await fetchCvs();
        alert('Perfil de comunero guardado exitosamente.');
      }
    } catch (err: any) {
      console.error('Error al guardar CV:', err);
      const msg = err.response?.data?.message || err.message;
      setDniCheck({ disponible: false, mensaje: msg });
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Base de Datos de Comuneros (Talentos)</h1>
          <p className="text-slate-500">Gestión centralizada de perfiles, habilidades y documentación legal.</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            <span>{isExporting ? 'Exportando...' : 'Exportar'}</span>
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors shadow-sm"
          >
            <UserPlus className="w-5 h-5" />
            <span>Nuevo Perfil</span>
          </button>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">Nuevo Perfil de Talento</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombres y Apellidos</label>
                <input 
                  type="text" 
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  placeholder="Ej: Juan Pérez"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">DNI</label>
                  <input 
                    type="text" 
                    required
                    maxLength={8}
                    value={formData.dni}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, '').slice(0, 8);
                      setFormData({...formData, dni: v});
                      setDniCheck(null);
                    }}
                    onBlur={async () => {
                      const digits = formData.dni.replace(/\D/g, '');
                      if (digits.length !== 8) return;
                      try {
                        const { data } = await api.get(`/cv/check-dni/${digits}`);
                        setDniCheck(data);
                      } catch {
                        /* ignore */
                      }
                    }}
                    placeholder="8 dígitos"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  {dniCheck && (
                    <p className={`text-xs mt-1 font-medium ${dniCheck.disponible === false ? 'text-red-600' : 'text-green-600'}`}>
                      {dniCheck.mensaje}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Sector / Comunidad</label>
                  <input 
                    type="text" 
                    required
                    value={formData.sector}
                    onChange={(e) => setFormData({...formData, sector: e.target.value})}
                    placeholder="Ej: Verdecocha"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Años de Experiencia</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    step="0.5"
                    value={formData.yearsExperience}
                    onChange={(e) => setFormData({...formData, yearsExperience: Number(e.target.value)})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Especialidad / Oficio</label>
                  <input 
                    type="text" 
                    required
                    value={formData.especialidad}
                    onChange={(e) => setFormData({...formData, especialidad: e.target.value})}
                    placeholder="Ej: Electricista"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-1">
                  <label className="block text-sm font-medium text-slate-700">Resumen Profesional (IA)</label>
                  <button
                    type="button"
                    onClick={handleGenerateIA}
                    disabled={isGeneratingIA || !formData.especialidad || formData.yearsExperience <= 0}
                    className="flex items-center space-x-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:text-slate-400 transition-colors bg-blue-50 px-2 py-1 rounded-md border border-blue-100"
                  >
                    {isGeneratingIA ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    <span>Generar Perfil con IA</span>
                  </button>
                </div>
                <div className="relative">
                  <textarea 
                    value={formData.aiSummary}
                    onChange={(e) => setFormData({...formData, aiSummary: e.target.value})}
                    placeholder="Haz clic en el botón superior para generar el resumen..."
                    rows={5}
                    className={`w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none text-sm ${isGeneratingIA ? 'bg-slate-50 text-slate-400 italic' : ''}`}
                    readOnly={isGeneratingIA}
                  />
                  {isGeneratingIA && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex items-center space-x-2 bg-white/80 px-4 py-2 rounded-full shadow-sm border border-slate-100">
                        <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                        <span className="text-xs font-medium text-slate-600">IA analizando perfil...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 flex space-x-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting || isGeneratingIA || !formData.aiSummary}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Guardar Perfil</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ver Perfil */}
      {isViewModalOpen && selectedCv && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
                  {selectedCv.user?.fullName?.split(' ').map((n: string) => n[0]).join('') || '??'}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{selectedCv.user?.fullName}</h2>
                  <p className="text-sm text-slate-500">Ficha de Talento</p>
                </div>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-white rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-8 max-h-[70vh] overflow-y-auto space-y-8">
              {/* Información Básica */}
              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">DNI Nacional</p>
                  <p className="text-sm font-semibold text-slate-700">{selectedCv.user?.dni}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Comunidad / Sector</p>
                  <p className="text-sm font-semibold text-slate-700">{selectedCv.user?.sector || selectedCv.user?.tenant?.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estado de Confianza</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    selectedCv.user?.trustLevel === 'VERDE' ? 'bg-green-100 text-green-800' :
                    selectedCv.user?.trustLevel === 'AMARILLO' ? 'bg-amber-100 text-amber-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedCv.user?.trustLevel}
                  </span>
                </div>
              </div>

              {/* Especialidad y Experiencia */}
              <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Especialidad Principal</p>
                  <p className="text-xl font-bold text-slate-800">{selectedCv.specialty || 'General'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Experiencia Total</p>
                  <p className="text-xl font-bold text-slate-800">{parseFloat(selectedCv.yearsExperience?.toString() || '0').toFixed(1)} Años</p>
                </div>
              </div>

              {/* Perfil IA */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-800">Resumen Profesional Generado por IA</h3>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-sm text-slate-600 leading-relaxed italic">
                    "{selectedCv.aiSummary}"
                  </p>
                </div>
              </div>

              {/* Habilidades (Placeholder para futura expansión) */}
              <div className="space-y-3">
                <h3 className="font-bold text-slate-800">Habilidades y Competencias</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCv.habilidades && selectedCv.habilidades.length > 0 ? (
                    selectedCv.habilidades.map((h: any) => (
                      <span key={h.id} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600">
                        {h.name}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400 italic">No se han registrado habilidades específicas aún.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3">
              <button 
                onClick={() => setIsViewModalOpen(false)}
                className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-colors"
              >
                Cerrar Ficha
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col gap-3">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
            <div className="relative md:col-span-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Buscar (nombre, DNI, oficio…)" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <input
              type="text"
              placeholder="DNI"
              maxLength={8}
              value={dniFilter}
              onChange={(e) => setDniFilter(e.target.value.replace(/\D/g, '').slice(0, 8))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
            <input
              type="text"
              placeholder="Empresa (experiencia/contrato)"
              value={empresaFilter}
              onChange={(e) => setEmpresaFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
            <label className="flex items-center gap-2 text-sm text-slate-700 px-2 py-2 border border-slate-200 rounded-lg cursor-pointer select-none">
              <input
                type="checkbox"
                checked={trabajoMina}
                onChange={(e) => setTrabajoMina(e.target.checked)}
                className="rounded border-slate-300"
              />
              Trabajó en mina
            </label>
            <button
              type="button"
              onClick={() => fetchCvs()}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold"
            >
              Buscar
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-500">
              Total: <span className="font-bold text-slate-800">{loading ? '...' : cvs.length}</span> perfiles
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Comunero</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Identificación</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Comunidad</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rol / Puntos</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Experiencia</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Confianza</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                      <p className="text-slate-500 text-sm">Cargando talentos...</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-red-500 font-medium">{error}</td>
                </tr>
              ) : cvs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">No hay perfiles de comuneros cargados actualmente.</td>
                </tr>
              ) : (
                cvs.map((cv) => (
                  <tr key={cv.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                          {cv.user?.fullName?.split(' ').map((n: string) => n[0]).join('') || '??'}
                        </div>
                        <div>
                          <div className="flex items-center">
                            <span className="font-medium text-slate-900">{cv.user?.fullName || 'N/A'}</span>
                            {(cv.trabajoEnMina ||
                              Number(cv.yearsExperienceMining) > 0) && (
                              <span className="ml-2 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                                Trabajó en mina
                              </span>
                            )}
                            {cv.user?.trustLevel === 'VERDE' && (
                              <ShieldCheck className="w-4 h-4 text-blue-500 ml-1.5" />
                            )}
                          </div>
                          <div className="text-xs text-slate-500">
                            Miembro desde {cv.user?.createdAt ? new Date(cv.user.createdAt).getFullYear() : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900 font-mono">{cv.user?.dni || 'N/A'}</div>
                      <div className="text-xs text-slate-400">DNI Nacional</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-slate-600">
                        <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                        {cv.user?.sector || cv.user?.tenant?.name || 'Sin Comunidad'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-700 font-medium">{cv.user?.role || 'N/A'}</div>
                      <div className="text-xs text-blue-600 font-bold">{cv.user?.points || 0} pts</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-700">{parseFloat(cv.yearsExperience?.toString() || '0').toFixed(1)} años</div>
                      <div className="text-xs text-slate-400">
                        {parseFloat(cv.yearsExperienceMining?.toString() || '0') > 0 
                          ? `${parseFloat(cv.yearsExperienceMining?.toString() || '0').toFixed(1)} minera`
                          : (cv.specialty || '-')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        cv.user?.trustLevel === 'VERDE' ? 'bg-green-100 text-green-800' :
                        cv.user?.trustLevel === 'AMARILLO' ? 'bg-amber-100 text-amber-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {cv.user?.trustLevel || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleViewProfile(cv)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" 
                          title="Ver Perfil Completo"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
