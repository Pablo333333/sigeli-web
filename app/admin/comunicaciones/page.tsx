'use client';

import React, { useEffect, useState } from 'react';
import api from '@/services/api';
import { MessageSquare, Loader2, Send, ArrowLeft, Bell } from 'lucide-react';

const ESTADO_LABEL: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  LEIDO: 'Leído',
  RESPONDIDO: 'Respondido',
};

export default function ComunicacionesPage() {
  const [conversaciones, setConversaciones] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [thread, setThread] = useState<any>(null);
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [sending, setSending] = useState(false);
  const [processingAlerts, setProcessingAlerts] = useState(false);
  const [alertResult, setAlertResult] = useState<string | null>(null);
  const [userRole, setUserRole] = useState('ADMIN');

  const loadConversaciones = async () => {
    setLoading(true);
    try {
      const res = await api.get('/chat/conversaciones');
      setConversaciones(Array.isArray(res.data) ? res.data : []);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openThread = async (id: string) => {
    setSelectedId(id);
    setLoadingThread(true);
    try {
      const res = await api.get(`/chat/postulacion/${id}`);
      setThread(res.data);
    } catch (e: any) {
      alert(e.response?.data?.message || e.message);
      setSelectedId(null);
    } finally {
      setLoadingThread(false);
    }
  };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !mensaje.trim()) return;
    setSending(true);
    try {
      await api.post('/chat/send', { postulacionId: selectedId, mensaje: mensaje.trim() });
      setMensaje('');
      await openThread(selectedId);
      await loadConversaciones();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setSending(false);
    }
  };

  const runDeadlineAlerts = async () => {
    setProcessingAlerts(true);
    setAlertResult(null);
    try {
      const res = await api.post('/notificaciones/procesar-deadlines?dias=5');
      setAlertResult(
        `Alertas procesadas: ${res.data.enviadas} enviadas / ${res.data.revisadas} deadlines revisados.`,
      );
    } catch (e: any) {
      setAlertResult(e.response?.data?.message || e.message);
    } finally {
      setProcessingAlerts(false);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('talento_user');
    if (stored) {
      try {
        setUserRole(JSON.parse(stored)?.role || 'ADMIN');
      } catch {
        /* ignore */
      }
    }
    loadConversaciones();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Comunicaciones de convocatoria</h1>
          <p className="text-slate-500">
            Chat por postulación con evidencia: fecha, remitente, destinatario, mensaje y estado.
          </p>
        </div>
        {['ADMIN', 'DIRECTIVA', 'EMPRESA'].includes(userRole) && (
          <button
            onClick={runDeadlineAlerts}
            disabled={processingAlerts}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium disabled:opacity-50"
          >
            {processingAlerts ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Bell className="w-4 h-4" />
            )}
            Ejecutar alertas 5 días
          </button>
        )}
      </div>

      {alertResult && (
        <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {alertResult}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-[560px]">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden lg:col-span-1">
          <div className="p-4 border-b border-slate-100 font-semibold text-slate-700 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" /> Conversaciones
          </div>
          {loading ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : conversaciones.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">No hay conversaciones aún.</p>
          ) : (
            <ul className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto">
              {conversaciones.map((c) => (
                <li key={c.postulacionId}>
                  <button
                    onClick={() => openThread(c.postulacionId)}
                    className={`w-full text-left p-4 hover:bg-slate-50 transition-colors ${
                      selectedId === c.postulacionId ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex justify-between gap-2">
                      <p className="font-semibold text-slate-800 text-sm">{c.puesto}</p>
                      {c.pendientes > 0 && (
                        <span className="text-[10px] font-bold bg-red-500 text-white rounded-full px-2 py-0.5 h-fit">
                          {c.pendientes}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {c.candidato}
                      {c.empresa ? ` · ${c.empresa}` : ''}
                    </p>
                    {c.ultimoMensaje && (
                      <p className="text-xs text-slate-400 mt-2 line-clamp-1">
                        {c.ultimoMensaje.de}: {c.ultimoMensaje.texto}
                      </p>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden lg:col-span-2 flex flex-col">
          {!selectedId ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm p-8">
              Seleccione una postulación para ver la trazabilidad de mensajes.
            </div>
          ) : loadingThread ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-slate-100 flex items-start gap-3">
                <button
                  className="lg:hidden p-1"
                  onClick={() => {
                    setSelectedId(null);
                    setThread(null);
                  }}
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="font-bold text-slate-800">
                    {thread?.postulacion?.oferta?.title}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {thread?.postulacion?.candidato?.fullName} · Estado proceso:{' '}
                    {thread?.postulacion?.status}
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[420px] bg-slate-50">
                {(thread?.mensajes || []).map((m: any) => (
                  <div
                    key={m.id}
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                      m.esMio
                        ? 'ml-auto bg-blue-600 text-white rounded-br-md'
                        : 'mr-auto bg-white border border-slate-200 text-slate-800 rounded-bl-md'
                    }`}
                  >
                    {!m.esMio && (
                      <p className="text-[11px] opacity-80 mb-1 font-semibold">
                        {m.remitente?.fullName} → {m.destinatario?.fullName}
                      </p>
                    )}
                    <p className="whitespace-pre-wrap">{m.mensaje}</p>
                    <div
                      className={`mt-2 flex justify-end gap-2 text-[10px] ${
                        m.esMio ? 'text-blue-100' : 'text-slate-400'
                      }`}
                    >
                      <span>{new Date(m.fecha).toLocaleString()}</span>
                      <span className="font-semibold">{ESTADO_LABEL[m.estado] || m.estado}</span>
                    </div>
                  </div>
                ))}
                {(thread?.mensajes || []).length === 0 && (
                  <p className="text-center text-slate-400 text-sm py-10">
                    Sin mensajes. Envíe el primero para registrar evidencia.
                  </p>
                )}
              </div>

              <form onSubmit={send} className="p-4 border-t border-slate-100 flex gap-2">
                <input
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  placeholder="Escriba un mensaje de coordinación..."
                  className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={sending || !mensaje.trim()}
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-xl disabled:opacity-50 inline-flex items-center gap-2 font-semibold"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Enviar
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
