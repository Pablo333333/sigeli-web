import React from 'react';
import './globals.css';

export const metadata = {
  title: 'SIGELI - Sistema de Gestión de Empleo Local Inteligente',
  description: 'Plataforma para la gestión de empleo local y transparencia.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  );
}
