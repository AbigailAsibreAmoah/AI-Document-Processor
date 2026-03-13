'use client';

import { useState } from 'react';
import { ProtectedRoute } from '../components/protected-route';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { HakunaAI } from './hakuna-ai';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="h-screen flex bg-gray-50">

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-200 ease-in-out
          md:relative md:translate-x-0 md:flex md:flex-shrink-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <Header onMenuClick={() => setSidebarOpen(v => !v)} />

          <main className="flex-1 overflow-auto p-4 md:p-6">
            {children}
          </main>
        </div>

        <HakunaAI />
      </div>
    </ProtectedRoute>
  );
}