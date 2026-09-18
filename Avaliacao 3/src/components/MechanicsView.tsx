import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Mechanic } from '../types';
import {
  UserCheck,
  UserPlus,
  Search,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Wrench,
  AlertCircle,
  X,
  Check,
  PowerOff,
  Power,
} from 'lucide-react';

export const MechanicsView: React.FC = () => {
  const { mechanics, serviceOrders, addMechanic, updateMechanic, deleteMechanic } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingMechanic, setEditingMechanic] = useState<Mechanic | null>(null);

  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('Motores e Transmissões');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'ativo' | 'inativo'>('ativo');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Conflict modal when trying to delete with open OS
  const [conflictMechanic, setConflictMechanic] = useState<{ id: string; name: string; message: string } | null>(
    null
  );

  const openCreateModal = () => {
    setEditingMechanic(null);
    setName('');
    setSpecialty('Motores e Transmissões');
    setPhone('');
    setEmail('');
    setStatus('ativo');
    setErrorMessage('');
    setSuccessMessage('');
    setShowModal(true);
  };

  const openEditModal = (m: Mechanic) => {
    setEditingMechanic(m);
    setName(m.name);
    setSpecialty(m.specialty);
    setPhone(m.phone);
    setEmail(m.email);
    setStatus(m.status);
    setErrorMessage('');
    setSuccessMessage('');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name.trim() || !phone.trim()) {
      setErrorMessage('Nome e Telefone são campos obrigatórios.');
      return;
    }

    if (editingMechanic) {
      const res = updateMechanic(editingMechanic.id, {
        name: name.trim(),
        specialty,
        phone: phone.trim(),
        email: email.trim(),
        status,
      });
      if (!res.success) {
        setErrorMessage(res.message || 'Erro ao atualizar mecânico.');
        return;
      }
      setSuccessMessage('Mecânico atualizado com sucesso!');
      setTimeout(() => setShowModal(false), 800);
    } else {
      const res = addMechanic({
        name: name.trim(),
        specialty,
        phone: phone.trim(),
        email: email.trim(),
        status,
      });
      if (!res.success) {
        setErrorMessage(res.message || 'Erro ao cadastrar mecânico.');
        return;
      }
      setSuccessMessage('Mecânico registado com sucesso!');
      setTimeout(() => setShowModal(false), 800);
    }
  };

  const handleDelete = (id: string, name: string) => {
    const res = deleteMechanic(id);
    if (!res.success) {
      // Regra CU06: Bloqueia e sugere inativação
      setConflictMechanic({
        id,
        name,
        message: res.message || 'O mecânico tem OS em aberto.',
      });
    }
  };

  const handleInactivateInstead = (id: string) => {
    updateMechanic(id, { status: 'inativo' });
    setConflictMechanic(null);
    alert('Mecânico inativado com sucesso. Ele não receberá novas Ordens de Serviço.');
  };

  const toggleStatus = (m: Mechanic) => {
    const newStatus = m.status === 'ativo' ? 'inativo' : 'ativo';
    updateMechanic(m.id, { status: newStatus });
  };

  // Filtered
  const filtered = mechanics.filter((m) => {
    const term = searchTerm.toLowerCase();
    return (
      m.name.toLowerCase().includes(term) ||
      m.specialty.toLowerCase().includes(term) ||
      m.phone.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Gestão de Mecânicos / Técnicos (CU06 / RF06)</h2>
            <p className="text-xs text-slate-500">
              Controlo de especialidades, disponibilidade de atribuição e status ativo/inativo
            </p>
          </div>
        </div>

        <button
          id="btn-new-mechanic"
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow transition w-full sm:w-auto"
        >
          <UserPlus className="w-4 h-4" />
          Registar Novo Mecânico
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Pesquisar mecânico por nome, especialidade ou contacto..."
          className="w-full text-xs sm:text-sm bg-transparent outline-none text-slate-800 placeholder-slate-400"
        />
      </div>

      {/* Mechanics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((mec) => {
          const activeOS = serviceOrders.filter(
            (os) => os.mechanicId === mec.id && os.status !== 'Concluída'
          );

          return (
            <div
              key={mec.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-amber-400 transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{mec.name}</h3>
                    <p className="text-xs text-amber-700 font-medium flex items-center gap-1 mt-0.5">
                      <Wrench className="w-3.5 h-3.5" />
                      {mec.specialty}
                    </p>
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      mec.status === 'ativo'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {mec.status === 'ativo' ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 pt-1 border-t border-slate-100">
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {mec.phone}
                  </p>
                  {mec.email && (
                    <p className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {mec.email}
                    </p>
                  )}
                  <div className="pt-1 text-[11px] font-semibold text-slate-700">
                    Carga de Trabalho Atual:{' '}
                    <span className="text-blue-600 font-bold">{activeOS.length} OS em andamento</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => toggleStatus(mec)}
                  className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border transition ${
                    mec.status === 'ativo'
                      ? 'border-slate-300 text-slate-600 hover:bg-slate-100'
                      : 'border-emerald-300 bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {mec.status === 'ativo' ? (
                    <>
                      <PowerOff className="w-3 h-3" />
                      Inativar
                    </>
                  ) : (
                    <>
                      <Power className="w-3 h-3" />
                      Ativar
                    </>
                  )}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(mec)}
                    title="Editar Mecânico"
                    className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(mec.id, mec.name)}
                    title="Remover Mecânico"
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Cadastro / Edição de Mecânico (CU06) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-amber-500" />
                {editingMechanic ? 'Editar Mecânico' : 'Registar Técnico / Mecânico (CU06)'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
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
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nome do Mecânico / Técnico <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Mestre João Silva"
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Especialidade Técnica
                </label>
                <select
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-amber-500 bg-white"
                >
                  <option value="Motores e Transmissões">Motores e Transmissões</option>
                  <option value="Eletricidade e Eletrónica Automóvel">Eletricidade e Eletrónica Automóvel</option>
                  <option value="Suspensão, Freios e Direção">Suspensão, Freios e Direção</option>
                  <option value="Diagnóstico Computadorizado">Diagnóstico Computadorizado</option>
                  <option value="Mecânica Geral e Revisões">Mecânica Geral e Revisões</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Telefone / Contacto <span className="text-red-500">*</span>
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

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Estado
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-amber-500 bg-white"
                  >
                    <option value="ativo">Ativo (Pode receber OS)</option>
                    <option value="inativo">Inativo (Temporariamente fora)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  E-mail (Opcional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ex: joao@oficina.com"
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
                  {editingMechanic ? 'Guardar Alterações' : 'Registar Mecânico'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Regra CU06 (Bloqueio de exclusão quando tem OS em aberto) */}
      {conflictMechanic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-600 mb-3">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-slate-900">
                Ação Bloqueada — Regra CU06 do Sistema
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              {conflictMechanic.message}
            </p>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 mb-6">
              <strong>Regra de Negócio:</strong> "Se o mecânico tiver OS em aberto, o sistema impede a remoção e sugere apenas inativação para manter o histórico de manutenção dos veículos íntegro."
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConflictMechanic(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
              >
                Voltar
              </button>
              <button
                onClick={() => handleInactivateInstead(conflictMechanic.id)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 shadow transition"
              >
                Apenas Inativar Mecânico
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
