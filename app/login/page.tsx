'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { Lock, Mail, Loader2 } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { BrandMeta } from '@/lib/brand';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, user } = response.data;

      localStorage.setItem('sigeli_token', access_token);
      localStorage.setItem('sigeli_user', JSON.stringify(user));
      document.cookie = `sigeli_token=${access_token}; path=/; max-age=86400; SameSite=Lax`;

      if (user?.role === 'COMUNERO') {
        setError('Los comuneros deben ingresar por la app móvil SIGELI.');
        localStorage.removeItem('sigeli_token');
        localStorage.removeItem('sigeli_user');
        document.cookie = 'sigeli_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        return;
      }

      router.push('/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión. Verifique sus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-brand-surface rounded-3xl shadow-xl border border-brand-border overflow-hidden">
        <div className="bg-brand-primary p-10 text-center">
          <BrandLogo size={80} variant="full" light />
          <p className="text-white/85 mt-3 text-sm leading-relaxed">{BrandMeta.tagline}</p>
        </div>

        <div className="p-8">
          <h2 className="text-xl font-bold text-brand-text mb-6 text-center">Acceso al Panel</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-brand-danger text-sm rounded-xl text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-brand-text mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted w-5 h-5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sigeli.com"
                  className="input-rural pl-11"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-brand-text mb-1.5">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted w-5 h-5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-rural pl-11"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-rural w-full text-lg">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Iniciar Sesión</span>}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-brand-border text-center">
            <p className="text-brand-muted text-sm">
              ¿Olvidaste tu contraseña?{' '}
              <a href="#" className="text-brand-primary font-semibold hover:underline">
                Contactar soporte
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
