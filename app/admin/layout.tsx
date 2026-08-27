'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  GraduationCap,
  ShieldCheck,
  MessageSquareWarning,
  Users,
  MessageSquare,
  LogOut,
  Loader2,
  MapPinned,
  FileText,
} from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { BrandMeta } from '@/lib/brand';

type MenuItem = {
  icon: any;
  label: string;
  href: string;
  roles: string[];
};

const ROLE_LABELS: Record<string, string> = {
  COMUNERO: 'Comunero',
  EMPRESA: 'Empresa',
  ADMIN: 'Administrador',
  AUDITOR: 'Auditor',
  DIRECTIVA: 'Directiva Comunal',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedUser = localStorage.getItem('sigeli_user');
    const token = localStorage.getItem('sigeli_token');

    if (!token || !storedUser) {
      router.push('/login');
      return;
    }

    const parsed = JSON.parse(storedUser);
    if (parsed.role === 'COMUNERO') {
      localStorage.removeItem('sigeli_token');
      localStorage.removeItem('sigeli_user');
      document.cookie = 'sigeli_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      router.push('/login');
      return;
    }

    setUser(parsed);
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('sigeli_token');
    localStorage.removeItem('sigeli_user');
    document.cookie = 'sigeli_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/login');
  };

  const allMenuItems: MenuItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin', roles: ['ADMIN', 'DIRECTIVA', 'EMPRESA', 'AUDITOR'] },
    { icon: MapPinned, label: 'Mapas de calor', href: '/admin/mapas', roles: ['ADMIN', 'DIRECTIVA', 'EMPRESA', 'AUDITOR'] },
    { icon: Briefcase, label: 'Ofertas', href: '/admin/ofertas', roles: ['ADMIN', 'EMPRESA', 'DIRECTIVA'] },
    { icon: Users, label: 'Postulaciones', href: '/admin/postulaciones', roles: ['ADMIN', 'EMPRESA', 'DIRECTIVA'] },
    { icon: FileText, label: 'Contratos', href: '/admin/contratos', roles: ['ADMIN', 'EMPRESA', 'DIRECTIVA'] },
    { icon: MessageSquare, label: 'Comunicaciones', href: '/admin/comunicaciones', roles: ['ADMIN', 'EMPRESA', 'DIRECTIVA'] },
    { icon: GraduationCap, label: 'Capacitaciones', href: '/admin/capacitaciones', roles: ['ADMIN', 'EMPRESA', 'DIRECTIVA'] },
    { icon: ShieldCheck, label: 'Transparencia', href: '/admin/transparencia', roles: ['ADMIN', 'DIRECTIVA', 'AUDITOR'] },
    { icon: MessageSquareWarning, label: 'Reclamos', href: '/admin/reclamos', roles: ['ADMIN', 'EMPRESA'] },
    { icon: Users, label: 'Comuneros', href: '/admin/comuneros', roles: ['ADMIN', 'DIRECTIVA', 'EMPRESA'] },
  ];

  const menuItems = useMemo(() => {
    const role = user?.role || 'ADMIN';
    return allMenuItems.filter((item) => item.roles.includes(role));
  }, [user?.role]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-brand-bg">
        <Loader2 className="w-10 h-10 text-brand-primary animate-spin mb-4" />
        <p className="text-brand-muted font-medium">Verificando sesión...</p>
      </div>
    );
  }

  const panelTitle =
    user?.role === 'DIRECTIVA'
      ? 'Panel Directiva Comunal'
      : user?.role === 'EMPRESA'
        ? 'Panel Empresa'
        : 'Panel Administrativo';

  return (
    <div className="flex h-screen bg-brand-bg">
      <aside className="w-64 bg-brand-surface border-r border-brand-border flex flex-col">
        <div className="p-5 border-b border-brand-border bg-brand-primary text-white">
          <div className="flex items-center gap-3">
            <BrandLogo size={44} light />
            <div>
              <h1 className="text-xl font-extrabold tracking-wide">{BrandMeta.appName}</h1>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-white/70 mt-0.5">
                {panelTitle}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-3 rounded-xl transition-colors group min-h-touch text-base ${
                pathname === item.href
                  ? 'bg-brand-primary text-white'
                  : 'text-brand-muted hover:bg-brand-soft hover:text-brand-primary'
              }`}
            >
              <item.icon
                className={`w-5 h-5 shrink-0 ${
                  pathname === item.href ? 'text-white' : 'group-hover:text-brand-primary'
                }`}
              />
              <span className="font-semibold">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-brand-border">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-3 w-full min-h-touch text-brand-danger hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-semibold">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="min-h-touch bg-brand-surface border-b border-brand-border flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-base md:text-lg font-semibold text-brand-text">{BrandMeta.tagline}</h2>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-bold text-brand-text">{user?.fullName || 'Usuario'}</p>
              <p className="text-xs text-brand-muted font-medium">
                {ROLE_LABELS[user?.role] || user?.role || 'Rol'}
              </p>
            </div>
            <div className="w-11 h-11 rounded-full bg-brand-soft flex items-center justify-center text-brand-primary font-bold border-2 border-brand-border shadow-sm">
              {user?.fullName?.split(' ').map((n: any) => n[0]).join('') || 'U'}
            </div>
          </div>
        </header>

        <div className="p-8">
          {user?.role === 'DIRECTIVA' && (
            <div className="mb-6 rounded-xl border border-brand-border bg-brand-soft px-4 py-3 text-sm text-brand-primary">
              Acceso de <strong>Directiva Comunal</strong>: monitoreo, ofertas, comuneros y seguimiento.
              Sin gestión de reclamos ni registro de contratos/evaluaciones.
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
