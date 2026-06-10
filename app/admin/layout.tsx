import React from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Briefcase, 
  GraduationCap, 
  ShieldCheck, 
  MessageSquareWarning,
  Users,
  Settings
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
    { icon: Briefcase, label: 'Ofertas', href: '/admin/ofertas' },
    { icon: GraduationCap, label: 'Capacitaciones', href: '/admin/capacitaciones' },
    { icon: ShieldCheck, label: 'Transparencia', href: '/admin/transparencia' },
    { icon: MessageSquareWarning, label: 'Reclamos', href: '/admin/reclamos' },
    { icon: Users, label: 'Comuneros', href: '/admin/comuneros' },
  ];

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
              className="flex items-center space-x-3 p-3 text-slate-600 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors group"
            >
              <item.icon className="w-5 h-5 group-hover:text-blue-600" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button className="flex items-center space-x-3 p-3 w-full text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
            <Settings className="w-5 h-5" />
            <span className="font-medium">Configuración</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-slate-800">Sistema de Gestión de Empleo Local Inteligente</h2>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">Admin SIGELI</p>
              <p className="text-xs text-slate-500">Administrador Central</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
              AD
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
