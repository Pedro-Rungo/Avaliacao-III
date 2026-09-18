import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ServiceOrder, OSStatus } from '../types';
import {
  FileText,
  PlusCircle,
  Search,
  Filter,
  Wrench,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Car,
  User,
  Package,
  Plus,
  Trash2,
  Receipt,
  X,
  Calendar,
  DollarSign,
  AlertCircle,
  Check,
} from 'lucide-react';

export const ServiceOrdersView: React.FC = () => {
  const {
    currentUser,
    serviceOrders,
    clients,
    vehicles,
    mechanics,
    parts,
    addServiceOrder,
    updateServiceOrder,
    updateOSStatus,
    addPartToOS,
    removePartFromOS,
    getClientById,
    getVehicleById,
    getMechanicById,
    setActiveTab,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [onlyMyOrders, setOnlyMyOrders] = useState<boolean>(currentUser.role === 'mecanico');

  // New OS Modal
  const [showNewOSModal, setShowNewOSModal] = useState(false);
  const [newClientId, setNewClientId] = useState('');
  const [newVehicleId, setNewVehicleId] = useState('');
  const [newMechanicId, setNewMechanicId] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newLaborCost, setNewLaborCost] = useState<number>(2000);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Selected OS for detail and management
  const [selectedOS, setSelectedOS] = useState<ServiceOrder | null>(null);

  // Add Part to OS Form State
  const [showAddPartModal, setShowAddPartModal] = useState(false);
  const [selectedPartId, setSelectedPartId] = useState('');
  const [partQuantity, setPartQuantity] = useState<number>(1);
  const [partError, setPartError] = useState('');
  const [partSuccess, setPartSuccess] = useState('');

  // When client changes in New OS modal, update available vehicles
  const handleClientChange = (clientId: string) => {
    setNewClientId(clientId);
    const clientVehicles = vehicles.filter((v) => v.clientId === clientId);
    if (clientVehicles.length > 0) {
      setNewVehicleId(clientVehicles[0].id);
    } else {
      setNewVehicleId('');
    }
  };

  const openCreateModal = () => {
    const firstClient = clients.length > 0 ? clients[0].id : '';
    setNewClientId(firstClient);
    const clientVehicles = vehicles.filter((v) => v.clientId === firstClient);
    setNewVehicleId(clientVehicles.length > 0 ? clientVehicles[0].id : '');
    setNewMechanicId(mechanics.length > 0 ? mechanics[0].id : '');
    setNewDescription('');
    setNewLaborCost(2000);
    setFormError('');
    setFormSuccess('');
    setShowNewOSModal(true);
  };

  const handleCreateOS = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!newClientId) {
      setFormError('Selecione um cliente.');
      return;
    }
    if (!newVehicleId) {
      setFormError('O cliente selecionado não possui veículos cadastrados. Cadastre um veículo primeiro!');
      return;
    }
    if (!newDescription.trim()) {
      setFormError('Descreva o problema ou avaria relatada pelo cliente.');
      return;
    }

    const result = addServiceOrder({
      clientId: newClientId,
      vehicleId: newVehicleId,
      mechanicId: newMechanicId || undefined,
      problemDescription: newDescription.trim(),
      laborCost: Number(newLaborCost) || 0,
    });

    if (!result.success) {
      setFormError(result.message || 'Erro ao criar ordem de serviço.');
      return;
    }

    setFormSuccess(result.message || 'Ordem de serviço criada com sucesso!');
    setTimeout(() => {
      setShowNewOSModal(false);
    }, 800);
  };

  // Add Part to OS
  const handleAddPartSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPartError('');
    setPartSuccess('');

    if (!selectedOS || !selectedPartId) {
      setPartError('Selecione uma peça.');
      return;
    }

    const result = addPartToOS(selectedOS.id, selectedPartId, Number(partQuantity));
    if (!result.success) {
      setPartError(result.message || 'Erro ao associar peça.');
      return;
    }

    setPartSuccess(result.message || 'Peça adicionada e stock atualizado!');
    // Update local selectedOS state
    const updatedOS = serviceOrders.find((o) => o.id === selectedOS.id);
    if (updatedOS) setSelectedOS(updatedOS);

    setTimeout(() => {
      setShowAddPartModal(false);
      setPartQuantity(1);
    }, 600);
  };

  // Status Change Handler
  const handleStatusChange = (osId: string, newStatus: OSStatus) => {
    const result = updateOSStatus(osId, newStatus);
    if (result.success && selectedOS && selectedOS.id === osId) {
      setSelectedOS((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  // Filtered orders
  const filteredOrders = serviceOrders.filter((os) => {
    const client = getClientById(os.clientId);
    const vehicle = getVehicleById(os.vehicleId);
    const mechanic = getMechanicById(os.mechanicId);

    const term = searchTerm.toLowerCase();
    const matchesSearch =
      os.id.toLowerCase().includes(term) ||
      os.problemDescription.toLowerCase().includes(term) ||
      (client && client.name.toLowerCase().includes(term)) ||
      (vehicle && vehicle.plate.toLowerCase().includes(term)) ||
      (vehicle && vehicle.brand.toLowerCase().includes(term)) ||
      (mechanic && mechanic.name.toLowerCase().includes(term));

    const matchesStatus = statusFilter === 'all' || os.status === statusFilter;

    let matchesMechanic = true;
    if (onlyMyOrders && currentUser.mechanicId) {
      matchesMechanic = os.mechanicId === currentUser.mechanicId;
    }

    return matchesSearch && matchesStatus && matchesMechanic;
  });

  const statusBadges: Record<OSStatus, { label: string; color: string; icon: React.ElementType }> = {
    Pendente: { label: 'Pendente', color: 'bg-slate-100 text-slate-700 border-slate-300', icon: Clock },
    'Em execução': { label: 'Em execução', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Wrench },
    'Aguardando peça': {
      label: 'Aguardando Peça',
      color: 'bg-amber-50 text-amber-700 border-amber-300 animate-pulse',
      icon: AlertTriangle,
    },
    Concluída: { label: 'Concluída', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Ordens de Serviço (CU04 / CU05 / RF04)</h2>
            <p className="text-xs text-slate-500">
              Acompanhamento de reparações, requisição de peças com baixa automática e estados
            </p>
          </div>
        </div>

        {currentUser.role !== 'mecanico' && (
          <button
            id="btn-new-os"
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow transition w-full sm:w-auto"
          >
            <PlusCircle className="w-4 h-4" />
            Nova Ordem de Serviço
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="flex-1 flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar por OS, cliente, matrícula ou problema..."
              className="w-full text-xs sm:text-sm bg-transparent outline-none text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todas ({serviceOrders.length})
            </button>
            <button
              onClick={() => setStatusFilter('Pendente')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === 'Pendente'
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Pendente
            </button>
            <button
              onClick={() => setStatusFilter('Em execução')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === 'Em execução'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Em execução
            </button>
            <button
              onClick={() => setStatusFilter('Aguardando peça')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === 'Aguardando peça'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Aguardando peça
            </button>
            <button
              onClick={() => setStatusFilter('Concluída')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === 'Concluída'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Concluída
            </button>
          </div>
        </div>

        {/* Mechanic Only Filter Toggle */}
        {currentUser.mechanicId && (
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-600 font-medium">
              Você está autenticado como <strong>{currentUser.name}</strong>
            </span>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
              <input
                type="checkbox"
                checked={onlyMyOrders}
                onChange={(e) => setOnlyMyOrders(e.target.checked)}
                className="rounded text-amber-600"
              />
              Mostrar apenas as minhas OS atribuídas
            </label>
          </div>
        )}
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="py-12 text-center bg-white rounded-2xl border border-slate-200 p-8">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">Nenhuma Ordem de Serviço encontrada.</p>
            <p className="text-xs text-slate-400 mt-1">Ajuste os filtros ou crie uma nova OS para iniciar o fluxo.</p>
          </div>
        ) : (
          filteredOrders.map((os) => {
            const client = getClientById(os.clientId);
            const vehicle = getVehicleById(os.vehicleId);
            const mechanic = getMechanicById(os.mechanicId);
            const badge = statusBadges[os.status];
            const BadgeIcon = badge.icon;
            const partsTotal = os.partsUsed.reduce((acc, p) => acc + p.total, 0);

            return (
              <div
                key={os.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-amber-400 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                {/* Info Block */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-black px-2.5 py-1 bg-slate-900 text-amber-400 rounded-md">
                      {os.id}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${badge.color}`}
                    >
                      <BadgeIcon className="w-3.5 h-3.5" />
                      {badge.label}
                    </span>
                    <span className="text-xs text-slate-400">Criada em: {os.createdAt}</span>
                    {os.completedAt && (
                      <span className="text-xs text-emerald-600 font-medium">
                        • Concluída em: {os.completedAt}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <p className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Car className="w-4 h-4 text-amber-600" />
                      {vehicle?.brand} {vehicle?.model} ({vehicle?.plate})
                    </p>
                    <span className="text-slate-300">•</span>
                    <p className="text-slate-700 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      Cliente: <strong>{client?.name}</strong> ({client?.phone})
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                    <strong className="text-slate-800">Problema:</strong> {os.problemDescription}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                    <span>
                      Mecânico: <strong className="text-slate-700">{mechanic?.name || 'Não atribuído'}</strong>
                    </span>
                    <span>
                      Peças ({os.partsUsed.length}): <strong className="text-slate-700">{partsTotal.toLocaleString()} MT</strong>
                    </span>
                    <span>
                      Mão de Obra: <strong className="text-slate-700">{os.laborCost?.toLocaleString()} MT</strong>
                    </span>
                    <span>
                      Total Parcial: <strong className="text-slate-900 font-bold">{(partsTotal + (os.laborCost || 0)).toLocaleString()} MT</strong>
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    onClick={() => setSelectedOS(os)}
                    className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition"
                  >
                    Gerir & Peças
                  </button>

                  {/* Quick Status Buttons */}
                  {os.status === 'Pendente' && (
                    <button
                      onClick={() => handleStatusChange(os.id, 'Em execução')}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition"
                    >
                      Iniciar Serviço
                    </button>
                  )}

                  {os.status === 'Em execução' && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleStatusChange(os.id, 'Aguardando peça')}
                        className="px-2.5 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-xl text-xs font-semibold transition"
                        title="Falta de peça no stock"
                      >
                        Aguardar Peça
                      </button>
                      <button
                        onClick={() => handleStatusChange(os.id, 'Concluída')}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition"
                      >
                        Concluir
                      </button>
                    </div>
                  )}

                  {os.status === 'Aguardando peça' && (
                    <button
                      onClick={() => handleStatusChange(os.id, 'Em execução')}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition"
                    >
                      Retomar Execução
                    </button>
                  )}

                  {os.status === 'Concluída' && (
                    <button
                      onClick={() => setActiveTab('faturas')}
                      className="flex items-center gap-1 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold shadow-sm transition"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      {os.invoiceId ? 'Ver Fatura' : 'Emitir Fatura'}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Nova Ordem de Serviço (CU04) */}
      {showNewOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-500" />
                Registar Nova Ordem de Serviço (CU04)
              </h3>
              <button
                onClick={() => setShowNewOSModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}
            {formSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-start gap-2">
                <Check className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateOS} className="space-y-4">
              {/* Cliente */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cliente <span className="text-red-500">*</span>
                </label>
                <select
                  value={newClientId}
                  onChange={(e) => handleClientChange(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-amber-500 bg-white"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (NUIT: {c.document})
                    </option>
                  ))}
                </select>
              </div>

              {/* Veículo associado ao cliente selecionado */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Veículo do Cliente <span className="text-red-500">*</span>
                </label>
                {vehicles.filter((v) => v.clientId === newClientId).length === 0 ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between">
                    <span>Este cliente não possui veículos cadastrados!</span>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewOSModal(false);
                        setActiveTab('veiculos');
                      }}
                      className="font-bold underline text-amber-900"
                    >
                      Cadastrar Veículo Agora
                    </button>
                  </div>
                ) : (
                  <select
                    value={newVehicleId}
                    onChange={(e) => setNewVehicleId(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-amber-500 bg-white"
                  >
                    {vehicles
                      .filter((v) => v.clientId === newClientId)
                      .map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.plate} — {v.brand} {v.model} ({v.year})
                        </option>
                      ))}
                  </select>
                )}
              </div>

              {/* Mecânico Responsável */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mecânico / Técnico Atribuído
                </label>
                <select
                  value={newMechanicId}
                  onChange={(e) => setNewMechanicId(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-amber-500 bg-white"
                >
                  <option value="">Não atribuído de imediato</option>
                  {mechanics
                    .filter((m) => m.status === 'ativo')
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} — Especialidade: {m.specialty}
                      </option>
                    ))}
                </select>
              </div>

              {/* Descrição do Problema */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Descrição do Problema / Sintomas Relatados <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Ex: Barulho na suspensão ao passar por lombas; falhas de partida matinal..."
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-amber-500"
                />
              </div>

              {/* Estimativa de Mão de Obra */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Valor Estimado da Mão de Obra (MT)
                </label>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={newLaborCost}
                  onChange={(e) => setNewLaborCost(Number(e.target.value))}
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewOSModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 shadow transition"
                >
                  Registar Ordem de Serviço
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Gerir OS e Requisitar Peças (CU05, CU07) */}
      {selectedOS && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-black px-2.5 py-0.5 bg-slate-900 text-amber-400 rounded">
                    {selectedOS.id}
                  </span>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                      statusBadges[selectedOS.status].color
                    }`}
                  >
                    {selectedOS.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Gestão Operacional, Requisição de Peças e Alteração de Estado (CU05)
                </p>
              </div>
              <button
                onClick={() => setSelectedOS(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 pr-1 flex-1">
              {/* Informações Resumidas */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-500">Cliente:</span>
                    <p className="font-bold text-slate-800">{getClientById(selectedOS.clientId)?.name}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Veículo:</span>
                    <p className="font-bold text-slate-800">
                      {getVehicleById(selectedOS.vehicleId)?.brand} {getVehicleById(selectedOS.vehicleId)?.model} (
                      {getVehicleById(selectedOS.vehicleId)?.plate})
                    </p>
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Problema Relatado:</span>
                  <p className="text-slate-700 italic">{selectedOS.problemDescription}</p>
                </div>
              </div>

              {/* Status Update Controls */}
              <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-slate-800">Alterar Estado da OS (CU05):</h4>
                <div className="flex flex-wrap gap-2">
                  {(['Pendente', 'Em execução', 'Aguardando peça', 'Concluída'] as OSStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleStatusChange(selectedOS.id, st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        selectedOS.status === st
                          ? 'bg-amber-500 text-slate-950 shadow'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
                {selectedOS.status === 'Aguardando peça' && (
                  <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                    O administrador foi alertado sobre a falta de peças para esta viatura (Fluxo Alternativo CU05).
                  </p>
                )}
              </div>

              {/* Peças Utilizadas (CU07 / RF08) */}
              <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Package className="w-4 h-4 text-amber-600" />
                      Peças Utilizadas nesta Reparação (RF08)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      As peças adicionadas sofrem baixa automática direta no stock da oficina.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowAddPartModal(true);
                      setSelectedPartId(parts.length > 0 ? parts[0].id : '');
                      setPartQuantity(1);
                      setPartError('');
                      setPartSuccess('');
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg shadow-sm transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Adicionar Peça
                  </button>
                </div>

                {selectedOS.partsUsed.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2 text-center">
                    Nenhuma peça do stock foi vinculada a esta ordem ainda.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden">
                    {selectedOS.partsUsed.map((item, idx) => (
                      <div key={idx} className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-50">
                        <div>
                          <p className="font-semibold text-slate-800">{item.partName}</p>
                          <p className="text-[10px] text-slate-400">
                            Código: {item.partCode} • {item.quantity}x @ {item.unitPrice.toLocaleString()} MT
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-slate-900">
                            {item.total.toLocaleString()} MT
                          </span>
                          <button
                            onClick={() => {
                              removePartFromOS(selectedOS.id, item.partId);
                              // Atualiza modal
                              const current = serviceOrders.find((o) => o.id === selectedOS.id);
                              if (current) setSelectedOS(current);
                            }}
                            title="Remover e estornar ao stock"
                            className="text-slate-400 hover:text-red-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Totalizador */}
              <div className="p-3.5 bg-slate-900 text-white rounded-xl space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Subtotal Peças:</span>
                  <span className="font-mono">
                    {selectedOS.partsUsed.reduce((acc, p) => acc + p.total, 0).toLocaleString()} MT
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mão de Obra:</span>
                  <span className="font-mono">{selectedOS.laborCost?.toLocaleString()} MT</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-800 font-bold text-sm text-amber-400">
                  <span>Total da OS:</span>
                  <span className="font-mono">
                    {(
                      selectedOS.partsUsed.reduce((acc, p) => acc + p.total, 0) + (selectedOS.laborCost || 0)
                    ).toLocaleString()}{' '}
                    MT
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-2 border-t border-slate-100 flex justify-between items-center">
              {selectedOS.status === 'Concluída' && (
                <button
                  onClick={() => {
                    setSelectedOS(null);
                    setActiveTab('faturas');
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow"
                >
                  <Receipt className="w-4 h-4" />
                  Ir para Faturação
                </button>
              )}
              <button
                onClick={() => setSelectedOS(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl ml-auto"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Adicionar Peça e Debitar Stock (CU07) */}
      {showAddPartModal && selectedOS && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-500" />
                Adicionar Peça da Oficina
              </h3>
              <button
                onClick={() => setShowAddPartModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {partError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{partError}</span>
              </div>
            )}
            {partSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-start gap-2">
                <Check className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{partSuccess}</span>
              </div>
            )}

            <form onSubmit={handleAddPartSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Selecione a Peça do Stock <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedPartId}
                  onChange={(e) => setSelectedPartId(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-amber-500 bg-white"
                >
                  {parts.map((p) => (
                    <option key={p.id} value={p.id} disabled={p.quantity <= 0}>
                      {p.name} — Stock: {p.quantity} un. ({p.unitPrice.toLocaleString()} MT)
                      {p.quantity <= 0 ? ' [ESGOTADO]' : ''}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-400">
                  Regra CU07: Se a quantidade for maior que o stock, a saída é bloqueada com aviso.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Quantidade a Utilizar <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={partQuantity}
                  onChange={(e) => setPartQuantity(Number(e.target.value))}
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddPartModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 shadow transition"
                >
                  Confirmar e Debitar Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
