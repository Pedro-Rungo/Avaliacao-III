import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Client } from '../types';
import {
  Users,
  UserPlus,
  Search,
  Edit2,
  Trash2,
  Car,
  FileText,
  Phone,
  Mail,
  MapPin,
  FileCheck,
  AlertCircle,
  X,
  Check,
} from 'lucide-react';

export const ClientsView: React.FC = () => {
  const {
    clients,
    vehicles,
    addClient,
    updateClient,
    deleteClient,
    setActiveTab,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [document, setDocument] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Selected client for viewing vehicles modal
  const [selectedClientForVehicles, setSelectedClientForVehicles] = useState<Client | null>(null);

  const openCreateModal = () => {
    setEditingClient(null);
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setDocument('');
    setErrorMessage('');
    setSuccessMessage('');
    setShowModal(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setName(client.name);
    setPhone(client.phone);
    setEmail(client.email);
    setAddress(client.address);
    setDocument(client.document);
    setErrorMessage('');
    setSuccessMessage('');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name.trim() || !phone.trim() || !document.trim()) {
      setErrorMessage('Por favor, preencha todos os campos obrigatórios (Nome, Contacto e NUIT/Documento).');
      return;
    }

    if (editingClient) {
      const result = updateClient(editingClient.id, {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        document: document.trim(),
      });

      if (!result.success) {
        setErrorMessage(result.message || 'Erro ao atualizar cliente.');
        return;
      }
      setSuccessMessage('Cliente atualizado com sucesso!');
      setTimeout(() => setShowModal(false), 800);
    } else {
      const result = addClient({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        document: document.trim(),
      });

      if (!result.success) {
        setErrorMessage(result.message || 'Erro ao cadastrar cliente.');
        return;
      }
      setSuccessMessage('Cliente registado com sucesso!');
      setTimeout(() => setShowModal(false), 800);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Tem a certeza que deseja remover o cliente "${name}"?`)) {
      const result = deleteClient(id);
      if (!result.success) {
        alert(result.message);
      }
    }
  };

  // Filtered clients list
  const filteredClients = clients.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      c.document.toLowerCase().includes(term) ||
      c.phone.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Gestão de Clientes (CU02 / RF02)</h2>
              <p className="text-xs text-slate-500">
                Cadastro, consulta, edição e controlo de proprietários de viaturas
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            id="btn-new-client"
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow transition w-full sm:w-auto"
          >
            <UserPlus className="w-4 h-4" />
            Novo Cliente
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Pesquisar por nome, NUIT/documento, telefone ou email..."
          className="w-full text-xs sm:text-sm bg-transparent outline-none text-slate-800 placeholder-slate-400"
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="text-xs text-slate-400 hover:text-slate-600">
            Limpar
          </button>
        )}
      </div>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200 p-8">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">Nenhum cliente encontrado.</p>
            <p className="text-xs text-slate-400 mt-1">Tente ajustar a sua pesquisa ou adicione um novo cliente.</p>
          </div>
        ) : (
          filteredClients.map((client) => {
            const clientVehicles = vehicles.filter((v) => v.clientId === client.id);

            return (
              <div
                key={client.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-amber-400 hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base leading-tight">{client.name}</h3>
                      <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-mono font-semibold">
                        <FileCheck className="w-3 h-3 text-slate-500" />
                        NUIT: {client.document}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(client)}
                        title="Editar Cliente"
                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(client.id, client.name)}
                        title="Remover Cliente"
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 pt-1 border-t border-slate-100">
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {client.phone}
                    </p>
                    {client.email && (
                      <p className="flex items-center gap-2 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{client.email}</span>
                      </p>
                    )}
                    {client.address && (
                      <p className="flex items-center gap-2 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{client.address}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedClientForVehicles(client)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-700"
                  >
                    <Car className="w-4 h-4" />
                    <span>{clientVehicles.length} Veículo(s)</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('veiculos')}
                    className="text-[11px] text-slate-500 hover:underline"
                  >
                    + Novo Veículo
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Cadastro / Edição de Cliente (CU02) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-500" />
                {editingClient ? 'Editar Cliente' : 'Novo Registo de Cliente'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error / Success Notifications */}
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-start gap-2">
                <Check className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nome Completo ou Razão Social <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Carlos Alberto Mondlane"
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    NUIT / Documento de Identificação <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={document}
                    onChange={(e) => setDocument(e.target.value)}
                    placeholder="Ex: 100234589"
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-amber-500 font-mono"
                  />
                  <span className="text-[10px] text-slate-400">Verificação automática contra duplicados (CU02)</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Telefone / Contacto Principal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ex: +258 84 123 4567"
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Endereço de E-mail (Opcional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ex: cliente@email.com"
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Endereço Físico / Bairro / Cidade
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ex: Av. Eduardo Mondlane, nº 1420, Maputo"
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 shadow transition"
                >
                  {editingClient ? 'Guardar Alterações' : 'Registar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Ver Veículos do Cliente Selecionado */}
      {selectedClientForVehicles && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Car className="w-5 h-5 text-amber-500" />
                  Veículos de {selectedClientForVehicles.name}
                </h3>
                <p className="text-xs text-slate-500">Frota associada ao cliente</p>
              </div>
              <button
                onClick={() => setSelectedClientForVehicles(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {vehicles.filter((v) => v.clientId === selectedClientForVehicles.id).length === 0 ? (
                <div className="py-6 text-center text-slate-500 text-xs">
                  Nenhum veículo registado para este cliente ainda.
                </div>
              ) : (
                vehicles
                  .filter((v) => v.clientId === selectedClientForVehicles.id)
                  .map((veh) => (
                    <div
                      key={veh.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 bg-amber-100 text-amber-900 rounded">
                            {veh.plate}
                          </span>
                          <span className="text-xs font-bold text-slate-800">
                            {veh.brand} {veh.model}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Ano: {veh.year} • Cor: {veh.color} • Km: {veh.mileage.toLocaleString()} km
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedClientForVehicles(null);
                          setActiveTab('veiculos');
                        }}
                        className="px-2.5 py-1 bg-white border border-slate-300 hover:border-amber-500 text-slate-700 text-xs rounded-lg font-medium"
                      >
                        Ver Detalhes
                      </button>
                    </div>
                  ))
              )}
            </div>

            <div className="flex justify-between items-center pt-4 mt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  setSelectedClientForVehicles(null);
                  setActiveTab('veiculos');
                }}
                className="text-xs font-bold text-amber-600 hover:underline"
              >
                + Cadastrar Novo Veículo para este Cliente
              </button>
              <button
                onClick={() => setSelectedClientForVehicles(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
