import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Vehicle, ServiceOrder } from '../types';
import {
  Car,
  PlusCircle,
  Search,
  Edit2,
  Trash2,
  History,
  FileText,
  User,
  CheckCircle2,
  AlertCircle,
  X,
  Check,
  Calendar,
  Wrench,
  ChevronRight,
} from 'lucide-react';

export const VehiclesView: React.FC = () => {
  const {
    vehicles,
    clients,
    serviceOrders,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    getClientById,
    getMechanicById,
    getVehicleHistory,
    setActiveTab,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  // Form states
  const [clientId, setClientId] = useState('');
  const [plate, setPlate] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [color, setColor] = useState('');
  const [mileage, setMileage] = useState<number>(0);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // History modal
  const [historyVehicle, setHistoryVehicle] = useState<Vehicle | null>(null);

  const openCreateModal = () => {
    setEditingVehicle(null);
    setClientId(clients.length > 0 ? clients[0].id : '');
    setPlate('');
    setBrand('');
    setModel('');
    setYear(2022);
    setColor('');
    setMileage(50000);
    setErrorMessage('');
    setSuccessMessage('');
    setShowModal(true);
  };

  const openEditModal = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setClientId(vehicle.clientId);
    setPlate(vehicle.plate);
    setBrand(vehicle.brand);
    setModel(vehicle.model);
    setYear(vehicle.year);
    setColor(vehicle.color);
    setMileage(vehicle.mileage);
    setErrorMessage('');
    setSuccessMessage('');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!clientId) {
      setErrorMessage('Selecione um cliente proprietário para a viatura.');
      return;
    }
    if (!plate.trim() || !brand.trim() || !model.trim()) {
      setErrorMessage('Por favor, preencha a Matrícula, Marca e Modelo.');
      return;
    }

    if (editingVehicle) {
      const result = updateVehicle(editingVehicle.id, {
        clientId,
        plate: plate.trim().toUpperCase(),
        brand: brand.trim(),
        model: model.trim(),
        year: Number(year),
        color: color.trim(),
        mileage: Number(mileage),
      });

      if (!result.success) {
        setErrorMessage(result.message || 'Erro ao atualizar veículo.');
        return;
      }
      setSuccessMessage('Veículo atualizado com sucesso!');
      setTimeout(() => setShowModal(false), 800);
    } else {
      const result = addVehicle({
        clientId,
        plate: plate.trim().toUpperCase(),
        brand: brand.trim(),
        model: model.trim(),
        year: Number(year),
        color: color.trim(),
        mileage: Number(mileage),
      });

      if (!result.success) {
        setErrorMessage(result.message || 'Erro ao cadastrar veículo.');
        return;
      }
      setSuccessMessage('Veículo registado com sucesso!');
      setTimeout(() => setShowModal(false), 800);
    }
  };

  const handleDelete = (id: string, plate: string) => {
    if (window.confirm(`Tem a certeza que deseja remover o veículo de matrícula "${plate}"?`)) {
      const result = deleteVehicle(id);
      if (!result.success) {
        alert(result.message);
      }
    }
  };

  // Filtered vehicles
  const filteredVehicles = vehicles.filter((v) => {
    const term = searchTerm.toLowerCase();
    const client = getClientById(v.clientId);
    const clientName = client ? client.name.toLowerCase() : '';
    return (
      v.plate.toLowerCase().includes(term) ||
      v.brand.toLowerCase().includes(term) ||
      v.model.toLowerCase().includes(term) ||
      clientName.includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Gestão de Veículos (CU03 / RF03)</h2>
            <p className="text-xs text-slate-500">
              Associação de viaturas a clientes e consulta de histórico de manutenções
            </p>
          </div>
        </div>

        <button
          id="btn-new-vehicle"
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow transition w-full sm:w-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Novo Veículo
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Pesquisar por matrícula, marca, modelo ou proprietário..."
          className="w-full text-xs sm:text-sm bg-transparent outline-none text-slate-800 placeholder-slate-400"
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="text-xs text-slate-400 hover:text-slate-600">
            Limpar
          </button>
        )}
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVehicles.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200 p-8">
            <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">Nenhum veículo encontrado.</p>
            <p className="text-xs text-slate-400 mt-1">Registe um novo veículo associado a um cliente existente.</p>
          </div>
        ) : (
          filteredVehicles.map((vehicle) => {
            const client = getClientById(vehicle.clientId);
            const history = getVehicleHistory(vehicle.id);

            return (
              <div
                key={vehicle.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-amber-400 hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="inline-block font-mono text-xs font-black tracking-wider px-2.5 py-1 bg-slate-900 text-amber-400 rounded-md border border-slate-800 shadow-sm">
                        {vehicle.plate}
                      </span>
                      <h3 className="font-bold text-slate-900 text-base mt-2">
                        {vehicle.brand} {vehicle.model}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(vehicle)}
                        title="Editar Veículo"
                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(vehicle.id, vehicle.plate)}
                        title="Remover Veículo"
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 pt-1 border-t border-slate-100">
                    <p className="flex items-center gap-2 font-medium text-slate-800">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Proprietário: {client?.name || 'Não identificado'}</span>
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-slate-500 pt-1">
                      <p>Ano: <strong className="text-slate-700">{vehicle.year}</strong></p>
                      <p>Cor: <strong className="text-slate-700">{vehicle.color || 'N/D'}</strong></p>
                      <p className="col-span-2">
                        Quilometragem: <strong className="text-slate-700">{vehicle.mileage.toLocaleString()} km</strong>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions: History & Open Service Order */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setHistoryVehicle(vehicle)}
                    className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                  >
                    <History className="w-4 h-4" />
                    <span>Histórico ({history.length} OS)</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('ordens')}
                    className="flex items-center gap-1 text-xs font-bold text-amber-600 hover:underline"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Abrir OS
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Cadastro / Edição de Veículo (CU03) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Car className="w-5 h-5 text-amber-500" />
                {editingVehicle ? 'Editar Veículo' : 'Registar Novo Veículo (CU03)'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

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
              {/* Cliente Proprietário */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cliente Proprietário <span className="text-red-500">*</span>
                </label>
                {clients.length === 0 ? (
                  <p className="text-xs text-red-600">
                    Nenhum cliente cadastrado! Cadastre um cliente primeiro no módulo "Clientes".
                  </p>
                ) : (
                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-amber-500 bg-white"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} — NUIT: {c.document} ({c.phone})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Matrícula (Verificação única) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Matrícula do Veículo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={plate}
                  onChange={(e) => setPlate(e.target.value.toUpperCase())}
                  placeholder="Ex: AFM-423-MC"
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-amber-500 font-mono font-bold tracking-wider uppercase"
                />
                <span className="text-[10px] text-slate-400">
                  Validação automática: Se a matrícula já existir, o registo é bloqueado (CU03)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Marca <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Ex: Toyota, Nissan, Isuzu..."
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Modelo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="Ex: Hilux D-4D, Qashqai, C200..."
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ano</label>
                  <input
                    type="number"
                    min={1980}
                    max={2027}
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cor</label>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="Ex: Branco, Preto..."
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Quilómetros (Km)</label>
                  <input
                    type="number"
                    min={0}
                    value={mileage}
                    onChange={(e) => setMileage(Number(e.target.value))}
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-amber-500"
                  />
                </div>
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
                  {editingVehicle ? 'Guardar Alterações' : 'Registar Veículo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Histórico de Manutenção por Veículo (RF10) */}
      {historyVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-900 text-amber-400 rounded">
                    {historyVehicle.plate}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    {historyVehicle.brand} {historyVehicle.model} ({historyVehicle.year})
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Histórico completo de intervenções mecânicas e peças substituídas (RF10)
                </p>
              </div>
              <button
                onClick={() => setHistoryVehicle(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 pr-1 flex-1">
              {getVehicleHistory(historyVehicle.id).length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  <History className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  Nenhuma ordem de serviço registrada para este veículo ainda.
                </div>
              ) : (
                getVehicleHistory(historyVehicle.id).map((os) => {
                  const mechanic = getMechanicById(os.mechanicId);

                  return (
                    <div
                      key={os.id}
                      className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded">
                            {os.id}
                          </span>
                          <span
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                              os.status === 'Concluída'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {os.status}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {os.createdAt}
                        </span>
                      </div>

                      <div className="text-xs space-y-1">
                        <p className="font-semibold text-slate-800">Problema Relatado:</p>
                        <p className="text-slate-600 italic bg-white p-2 rounded border border-slate-200">
                          {os.problemDescription}
                        </p>
                      </div>

                      {os.diagnosis && (
                        <div className="text-xs space-y-1">
                          <p className="font-semibold text-slate-800">Diagnóstico / Intervenção:</p>
                          <p className="text-slate-600 bg-white p-2 rounded border border-slate-200">
                            {os.diagnosis}
                          </p>
                        </div>
                      )}

                      {/* Peças trocadas */}
                      <div className="text-xs pt-1">
                        <p className="font-semibold text-slate-800 mb-1 flex items-center gap-1">
                          <Wrench className="w-3.5 h-3.5 text-amber-600" />
                          Peças Substituídas ({os.partsUsed.length}):
                        </p>
                        {os.partsUsed.length === 0 ? (
                          <p className="text-slate-400 italic">Nenhuma peça do stock adicionada.</p>
                        ) : (
                          <div className="bg-white rounded border border-slate-200 divide-y divide-slate-100">
                            {os.partsUsed.map((p, idx) => (
                              <div key={idx} className="p-2 flex justify-between items-center text-[11px]">
                                <span className="font-medium text-slate-800">
                                  {p.quantity}x {p.partName}
                                </span>
                                <span className="font-mono text-slate-600">
                                  {p.total.toLocaleString()} MT
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200">
                        <span>Técnico Responsável: <strong className="text-slate-700">{mechanic?.name || 'Não atribuído'}</strong></span>
                        <span>Mão de Obra: <strong className="text-slate-700">{os.laborCost?.toLocaleString()} MT</strong></span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-4 mt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setHistoryVehicle(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Fechar Histórico
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
