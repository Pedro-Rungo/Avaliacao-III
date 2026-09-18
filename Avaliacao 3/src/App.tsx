import React from 'react';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { MainContent } from './components/MainContent';
import { Wrench } from 'lucide-react';

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-slate-100/70 text-slate-800 font-sans flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950">
        <div>
          <Navbar />
          <MainContent />
        </div>

        {/* Clean Footer */}
        <footer className="border-t border-slate-200 bg-white py-4 mt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-amber-500 flex items-center justify-center text-slate-950 font-bold">
                <Wrench className="w-3 h-3" />
              </div>
              <span className="font-semibold text-slate-700">
                SGOM — Sistema de Gestão de Oficina Mecânica de Automóveis
              </span>
            </div>
            <p>
              Sistema de Gestão de Oficina Mecânica • Maputo, Moçambique
            </p>
          </div>
        </footer>
      </div>
    </AppProvider>
  );
}
