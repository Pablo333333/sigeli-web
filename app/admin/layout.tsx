'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Briefcase, 
  GraduationCap, 
  ShieldCheck, 
  MessageSquareWarning,
  Users,
  Settings,
  LogOut,
  Loader2
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedUser = localStorage.getItem('sigeli_user');
    const token = localStorage.getItem('sigeli_token');

    if (!token || !storedUser) {
      router.push('/login');
    } else {
      setUser(JSON.parse(storedUser));
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('sigeli_token');
    localStorage.removeItem('sigeli_user');
    document.cookie = 'sigeli_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
    { icon: Briefcase, label: 'Ofertas', href: '/admin/ofertas' },
    { icon: GraduationCap, label: 'Capacitaciones', href: '/admin/capacitaciones' },
    { icon: ShieldCheck, label: 'Transparencia', href: '/admin/transparencia' },
    { icon: MessageSquareWarning, label: 'Reclamos', href: '/admin/reclamos' },
    { icon: Users, label: 'Comuneros', href: '/admin/comuneros' },
  ];

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Verificando sesión...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-2xl font-bold text-blue-800">SIGELI</h1>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Panel Administrativo</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-colors group ${
                pathname === item.href 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
              }`}
            >
              <item.icon className={`w-5 h-5 ${pathname === item.href ? 'text-white' : 'group-hover:text-blue-600'}`} />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-slate-800">Sistema de Gestión de Empleo Local Inteligente</h2>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-bold text-slate-900">{user?.fullName || 'Usuario'}</p>
              <p className="text-xs text-slate-500 font-medium">{user?.role || 'Rol'}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border-2 border-blue-200 shadow-sm">
              {user?.fullName?.split(' ').map((n: any) => n[0]).join('') || 'U'}
            </div>
          </div>
        </header>
        
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
