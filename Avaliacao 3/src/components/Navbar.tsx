import React, { useState } from 'react';
import { useApp, NavTab } from '../context/AppContext';
import {
  Wrench,
  Users,
  Car,
  FileText,
  Package,
  Receipt,
  UserCheck,
  ShieldCheck,
  Bell,
  RefreshCw,
  LogOut,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    users,
    setCurrentUser,
    activeTab,
    setActiveTab,
    notifications,
    markNotificationAsRead,
    clearAllNotifications,
    resetToDefaultData,
  } = useApp();

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const navItems: { id: NavTab; label: string; icon: React.ElementType; roles?: string[] }[] = [
    { id: 'dashboard', label: 'Início / Painel', icon: Wrench },
    { id: 'ordens', label: 'Ordens de Serviço', icon: FileText },
    { id: 'clientes', label: 'Clientes', icon: Users, roles: ['admin', 'atendente'] },
    { id: 'veiculos', label: 'Veículos', icon: Car, roles: ['admin', 'atendente'] },
    { id: 'stock', label: 'Stock de Peças', icon: Package, roles: ['admin', 'mecanico'] },
    { id: 'faturas', label: 'Faturamento', icon: Receipt, roles: ['admin', 'atendente'] },
    { id: 'mecanicos', label: 'Mecânicos', icon: UserCheck, roles: ['admin'] },
    { id: 'utilizadores', label: 'Permissões', icon: ShieldCheck, roles: ['admin'] },
  ];

  const visibleNavItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(currentUser.role);
  });

  return (
    <header className="bg-slate-900 text-white shadow-md sticky top-0 z-40">
      {/* Top Banner with Brand & User Switcher */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 border-b border-slate-800">
          {/* Logo & App Title */}
          <div
            id="brand-logo"
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black shadow group-hover:scale-105 transition-transform">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">SGOM</span>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-medium">Oficina Auto</span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Sistema de Gestão de Oficina Mecânica</p>
            </div>
          </div>

          {/* User Profile, Switcher & Quick Actions */}
          <div className="flex items-center space-x-3">
            {/* Reset Demo Data Button */}
            <button
              id="btn-reset-demo"
              onClick={() => setShowResetConfirm(true)}
              title="Restaurar dados originais para teste"
              className="hidden md:flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Repor Dados</span>
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                id="btn-notifications"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition"
                aria-label="Notificações do sistema"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-slate-950 font-bold text-[10px] rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div
                  id="notifications-popover"
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-4 z-50 text-slate-200"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <h4 className="font-semibold text-sm text-white">Notificações e Alertas ({notifications.length})</h4>
                    <button
                      onClick={clearAllNotifications}
                      className="text-xs text-slate-400 hover:text-amber-400"
                    >
                      Limpar
                    </button>
                  </div>
                  <div className="mt-2 max-h-72 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-500 py-3 text-center">Nenhuma notificação no momento.</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationAsRead(n.id)}
                          className={`p-2.5 rounded-lg text-xs cursor-pointer transition ${
                            n.read ? 'bg-slate-800/40 text-slate-400' : 'bg-slate-800 text-slate-200 border-l-2 border-amber-500'
                          }`}
                        >
                          <div className="flex items-center justify-between font-medium">
                            <span className="flex items-center gap-1.5 text-white">
                              {n.type === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                              {n.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                              {n.type === 'info' && <Info className="w-3.5 h-3.5 text-blue-400" />}
                              {n.title}
                            </span>
                            <span className="text-[10px] text-slate-400">{n.date}</span>
                          </div>
                          <p className="mt-1 text-slate-300 leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Current User & Quick Role Switch Button */}
            <div className="relative">
              <button
                id="btn-user-profile"
                onClick={() => setShowRoleModal(!showRoleModal)}
                className="flex items-center space-x-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
              >
                <div
                  className={`w-7 h-7 rounded-full ${currentUser.avatarColor} text-white font-bold text-xs flex items-center justify-center`}
                >
                  {currentUser.name.charAt(0)}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-semibold text-white leading-tight">{currentUser.name.split(' ')[0]}</p>
                  <p className="text-[10px] text-amber-400 font-medium capitalize">{currentUser.roleLabel}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {/* Role Switcher Popover */}
              {showRoleModal && (
                <div
                  id="user-role-popover"
                  className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 z-50 text-slate-200"
                >
                  <div className="px-2 py-1.5 mb-2 border-b border-slate-800">
                    <p className="text-xs text-slate-400 font-medium">Trocar Perfil de Acesso (Teste Rápido)</p>
                    <p className="text-[11px] text-slate-500">Veja o sistema sob o ponto de vista de cada ator</p>
                  </div>
                  <div className="space-y-1">
                    {users.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          setCurrentUser(u);
                          setShowRoleModal(false);
                        }}
                        className={`w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-lg text-xs text-left transition ${
                          currentUser.id === u.id
                            ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40'
                            : 'hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full ${u.avatarColor} text-white text-[11px] font-bold flex items-center justify-center shrink-0`}
                        >
                          {u.name.charAt(0)}
                        </div>
                        <div className="truncate">
                          <p className="font-medium text-white truncate">{u.name}</p>
                          <p className="text-[10px] text-slate-400">{u.roleLabel}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Modal de Confirmação para Redefinir Dados */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 text-slate-200 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-amber-400" />
              Restaurar Dados Originais de Teste?
            </h3>
            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              Esta ação irá restaurar todos os clientes, veículos, mecânicos, stock e ordens de serviço padrão da
              oficina. É ideal caso você tenha feito testes e queira recomeçar com o cenário limpo.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  resetToDefaultData();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400 shadow"
              >
                Sim, Restaurar Dados
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
