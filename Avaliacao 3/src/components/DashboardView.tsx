import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Wrench,
  Users,
  Car,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  PlusCircle,
  Package,
  Receipt,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    currentUser,
    clients,
    vehicles,
    serviceOrders,
    parts,
    invoices,
    setActiveTab,
    updateOSStatus,
    getClientById,
    getVehicleById,
    getMechanicById,
  } = useApp();

  const activeOrders = serviceOrders.filter((os) => os.status !== 'Concluída');
  const waitingPartsOrders = serviceOrders.filter((os) => os.status === 'Aguardando peça');
  const inProgressOrders = serviceOrders.filter((os) => os.status === 'Em execução');
  const pendingOrders = serviceOrders.filter((os) => os.status === 'Pendente');
  const completedOrders = serviceOrders.filter((os) => os.status === 'Concluída');
  const lowStockParts = parts.filter((p) => p.quantity <= p.minQuantity);

  const totalInvoiced = invoices.reduce((acc, inv) => acc + inv.total, 0);

  // If mechanic is logged in, filter orders assigned to him
  const myAssignedOrders = currentUser.mechanicId
    ? serviceOrders.filter((os) => os.mechanicId === currentUser.mechanicId)
    : [];

  return (
    <div className="space-y-6">
      {/* Welcome & Role Context Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold mb-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              Perfil Ativo: {currentUser.roleLabel}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Olá, {currentUser.name}!
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {currentUser.role === 'admin' &&
                'Painel de Controlo Geral da Oficina Mecânica. Você tem acesso completo para gerir utilizadores, mecânicos, ordens de serviço e stock.'}
              {currentUser.role === 'atendente' &&
                'Painel de Atendimento ao Cliente. Registe novos clientes, associe veículos, crie ordens de serviço e emita faturas das reparações concluídas.'}
              {currentUser.role === 'mecanico' &&
                'Painel Operacional do Mecânico. Consulte os trabalhos atribuídos, atualize o estado da reparação e associe as peças utilizadas na viatura.'}
            </p>
          </div>

          {/* Quick Action Shortcuts depending on Role */}
          <div className="flex flex-wrap items-center gap-2.5">
            {currentUser.role !== 'mecanico' && (
              <>
                <button
                  onClick={() => setActiveTab('ordens')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  Nova Ordem de Serviço
                </button>
                <button
                  onClick={() => setActiveTab('clientes')}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold border border-slate-700 transition"
                >
                  <Users className="w-4 h-4 text-amber-400" />
                  Registar Cliente
                </button>
              </>
            )}

            {currentUser.role === 'mecanico' && (
              <button
                onClick={() => setActiveTab('ordens')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow transition"
              >
                <Wrench className="w-4 h-4" />
                Ver Meus Serviços ({myAssignedOrders.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: OS em Andamento */}
        <div
          onClick={() => setActiveTab('ordens')}
          className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm hover:border-amber-400 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">OS em Aberto</span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900">{activeOrders.length}</span>
            <span className="text-xs text-slate-500 font-medium">veículos na oficina</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500">
            <span className="text-amber-600 font-semibold">{pendingOrders.length} pendentes</span>
            <span>•</span>
            <span className="text-blue-600 font-semibold">{inProgressOrders.length} em execução</span>
          </div>
        </div>

        {/* Card 2: Aguardando Peças (Atenção especial do documento CU05) */}
        <div
          onClick={() => setActiveTab('ordens')}
          className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm hover:border-amber-400 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Aguardando Peça</span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-amber-600">{waitingPartsOrders.length}</span>
            <span className="text-xs text-slate-500 font-medium">ordens travadas</span>
          </div>
          <p className="mt-2 text-[11px] text-amber-700 font-medium">Necessitam de reposição no stock</p>
        </div>

        {/* Card 3: Clientes e Veículos */}
        <div
          onClick={() => setActiveTab('clientes')}
          className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm hover:border-amber-400 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Clientes & Frotas</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900">{clients.length}</span>
            <span className="text-xs text-slate-500 font-medium">clientes cadastrados</span>
          </div>
          <p className="mt-2 text-[11px] text-emerald-700 font-medium flex items-center gap-1">
            <Car className="w-3.5 h-3.5" />
            {vehicles.length} viaturas associadas
          </p>
        </div>

        {/* Card 4: Faturamento Concluído */}
        <div
          onClick={() => setActiveTab('faturas')}
          className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm hover:border-amber-400 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Faturamento Total</span>
            <div className="w-9 h-9 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold text-slate-900">{totalInvoiced.toLocaleString()}</span>
            <span className="text-xs text-slate-500 font-semibold">MT</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500 font-medium">
            {invoices.length} fatura(s) emitida(s)
          </p>
        </div>
      </div>

      {/* Low Stock Warning Banner if any exists */}
      {lowStockParts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-700 shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold">
                Alerta de Gestão de Stock: {lowStockParts.length} peça(s) com quantidade crítica ou esgotada!
              </h4>
              <p className="text-xs text-amber-800">
                Peças com estoque abaixo do mínimo necessário para atender ordens de serviço.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('stock')}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shrink-0 transition"
          >
            Ver Stock de Peças
          </button>
        </div>
      )}

      {/* Grid: Active Service Orders & Quick Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column: Ordens de Serviço Recentes (2 Cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-500" />
                Ordens de Serviço em Andamento
              </h3>
              <p className="text-xs text-slate-500">
                Acompanhe o estado de reparação de cada viatura em tempo real
              </p>
            </div>
            <button
              onClick={() => setActiveTab('ordens')}
              className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              Ver Todas ({serviceOrders.length})
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 space-y-1">
            {serviceOrders.slice(0, 5).map((os) => {
              const client = getClientById(os.clientId);
              const vehicle = getVehicleById(os.vehicleId);
              const mechanic = getMechanicById(os.mechanicId);

              const statusColors: Record<string, string> = {
                Pendente: 'bg-slate-100 text-slate-700 border-slate-300',
                'Em execução': 'bg-blue-50 text-blue-700 border-blue-200',
                'Aguardando peça': 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse',
                Concluída: 'bg-emerald-50 text-emerald-700 border-emerald-200',
              };

              return (
                <div key={os.id} className="pt-3 pb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50/80 p-2 rounded-lg transition">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                        {os.id}
                      </span>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                          statusColors[os.status] || 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {os.status}
                      </span>
                      <span className="text-xs text-slate-400">• Aberta em {os.createdAt}</span>
                    </div>

                    <p className="text-xs font-semibold text-slate-800">
                      {vehicle?.brand} {vehicle?.model} ({vehicle?.plate}) — <span className="text-slate-600 font-normal">Cliente: {client?.name}</span>
                    </p>

                    <p className="text-xs text-slate-500 line-clamp-1 italic">
                      "{os.problemDescription}"
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span>Técnico: <strong className="text-slate-700">{mechanic?.name || 'Não atribuído'}</strong></span>
                      <span>•</span>
                      <span>Peças usadas: <strong className="text-slate-700">{os.partsUsed.length} item(ns)</strong></span>
                    </div>
                  </div>

                  {/* Actions for this OS */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => setActiveTab('ordens')}
                      className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                    >
                      Gerir OS
                    </button>
                    {os.status !== 'Concluída' && (
                      <button
                        onClick={() => {
                          const nextStatus = os.status === 'Pendente' ? 'Em execução' : 'Concluída';
                          updateOSStatus(os.id, nextStatus);
                        }}
                        className="px-2.5 py-1.5 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition"
                      >
                        {os.status === 'Pendente' ? 'Iniciar' : 'Concluir'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar Column: Atalhos e Regras do Sistema */}
        <div className="space-y-4">
          {/* Quick Guide Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Regras do Fluxo Operacional (SGOM)
            </h4>
            <div className="text-xs text-slate-600 space-y-2.5 leading-relaxed">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="font-bold text-slate-800">1. Atendimento:</span>
                <p className="text-slate-500 mt-0.5">O atendente cadastra o cliente e o veículo, gerando a Ordem de Serviço com estado inicial <em>Pendente</em>.</p>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="font-bold text-slate-800">2. Oficina:</span>
                <p className="text-slate-500 mt-0.5">O mecânico altera para <em>Em execução</em> e associa peças utilizadas. O stock é debitado automaticamente.</p>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="font-bold text-slate-800">3. Faturação:</span>
                <p className="text-slate-500 mt-0.5">Ao concluir o serviço, o atendente emite a fatura detalhada com mão de obra, peças e descontos justificados.</p>
              </div>
            </div>
          </div>

          {/* Mechanic active workloads */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-500" />
              Equipa Técnica da Oficina
            </h4>
            <div className="space-y-2">
              <div className="text-xs flex justify-between items-center py-1.5 border-b border-slate-100">
                <div>
                  <p className="font-semibold text-slate-800">Mestre João Silva</p>
                  <p className="text-[11px] text-slate-500">Motores e Transmissões</p>
                </div>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded text-[11px]">
                  2 OS ativas
                </span>
              </div>

              <div className="text-xs flex justify-between items-center py-1.5 border-b border-slate-100">
                <div>
                  <p className="font-semibold text-slate-800">António Langa</p>
                  <p className="text-[11px] text-slate-500">Eletricidade e Eletrónica</p>
                </div>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded text-[11px]">
                  1 OS ativa
                </span>
              </div>

              <div className="text-xs flex justify-between items-center py-1.5">
                <div>
                  <p className="font-semibold text-slate-800">Mateus Manhiça</p>
                  <p className="text-[11px] text-slate-500">Suspensão e Travões</p>
                </div>
                <span className="px-2 py-0.5 bg-amber-50 text-amber-700 font-bold rounded text-[11px]">
                  1 Aguardando
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
