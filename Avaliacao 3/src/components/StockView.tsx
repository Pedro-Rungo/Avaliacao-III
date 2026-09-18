import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Part } from '../types';
import {
  Package,
  PlusCircle,
  Search,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Edit2,
  Trash2,
  X,
  Check,
  AlertCircle,
  Building2,
  DollarSign,
  Tag,
} from 'lucide-react';

export const StockView: React.FC = () => {
  const { parts, addPart, updatePart, adjustStock, deletePart } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'low' | 'out'>('all');

  // Modal New/Edit Part
  const [showPartModal, setShowPartModal] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Filtros e Fluidos');
  const [quantity, setQuantity] = useState<number>(10);
  const [minQuantity, setMinQuantity] = useState<number>(3);
  const [unitPrice, setUnitPrice] = useState<number>(1000);
  const [supplier, setSupplier] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Modal Adjust Stock (Entrada / Saída)
  const [adjustingPart, setAdjustingPart] = useState<Part | null>(null);
  const [adjustType, setAdjustType] = useState<'in' | 'out'>('in');
  const [adjustQty, setAdjustQty] = useState<number>(5);
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustError, setAdjustError] = useState('');

  const openCreateModal = () => {
    setEditingPart(null);
    setCode('');
    setName('');
    setCategory('Filtros e Fluidos');
    setQuantity(10);
    setMinQuantity(3);
    setUnitPrice(1500);
    setSupplier('');
    setFormError('');
    setFormSuccess('');
    setShowPartModal(true);
  };

  const openEditModal = (p: Part) => {
    setEditingPart(p);
    setCode(p.code);
    setName(p.name);
    setCategory(p.category);
    setQuantity(p.quantity);
    setMinQuantity(p.minQuantity);
    setUnitPrice(p.unitPrice);
    setSupplier(p.supplier);
    setFormError('');
    setFormSuccess('');
    setShowPartModal(true);
  };

  const handlePartSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!code.trim() || !name.trim()) {
      setFormError('Código e Nome da peça são obrigatórios.');
      return;
    }

    if (editingPart) {
      const res = updatePart(editingPart.id, {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        category,
        quantity: Number(quantity),
        minQuantity: Number(minQuantity),
        unitPrice: Number(unitPrice),
        supplier: supplier.trim(),
      });
      if (!res.success) {
        setFormError(res.message || 'Erro ao atualizar peça.');
        return;
      }
      setFormSuccess('Peça atualizada com sucesso!');
      setTimeout(() => setShowPartModal(false), 800);
    } else {
      const res = addPart({
        code: code.trim().toUpperCase(),
        name: name.trim(),
        category,
        quantity: Number(quantity),
        minQuantity: Number(minQuantity),
        unitPrice: Number(unitPrice),
        supplier: supplier.trim(),
      });
      if (!res.success) {
        setFormError(res.message || 'Erro ao registar peça.');
        return;
      }
      setFormSuccess('Peça registada no stock com sucesso!');
      setTimeout(() => setShowPartModal(false), 800);
    }
  };

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdjustError('');

    if (!adjustingPart) return;
    if (adjustQty <= 0) {
      setAdjustError('A quantidade deve ser maior que zero.');
      return;
    }

    const change = adjustType === 'in' ? adjustQty : -adjustQty;
    const reason = adjustReason || (adjustType === 'in' ? 'Reposição de stock' : 'Saída manual');

    const res = adjustStock(adjustingPart.id, change, reason);
    if (!res.success) {
      setAdjustError(res.message || 'Falha ao movimentar stock.');
      return;
    }

    setAdjustingPart(null);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Tem a certeza que deseja excluir a peça "${name}" do stock?`)) {
      const res = deletePart(id);
      if (!res.success) {
        alert(res.message);
      }
    }
  };

  // Filter parts
  const filteredParts = parts.filter((p) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(term) ||
      p.code.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term) ||
      p.supplier.toLowerCase().includes(term);

    if (!matchesSearch) return false;

    if (filterType === 'low') return p.quantity <= p.minQuantity && p.quantity > 0;
    if (filterType === 'out') return p.quantity === 0;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Gestão de Stock de Peças (CU07 / RF07)</h2>
            <p className="text-xs text-slate-500">
              Controlo de entradas, saídas, níveis críticos e baixa automática nas Ordens de Serviço
            </p>
          </div>
        </div>

        <button
          id="btn-new-part"
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow transition w-full sm:w-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Registar Nova Peça
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex-1 w-full flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por nome da peça, código, categoria ou fornecedor..."
            className="w-full text-xs sm:text-sm bg-transparent outline-none text-slate-800 placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterType === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todas ({parts.length})
          </button>
          <button
            onClick={() => setFilterType('low')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterType === 'low'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Stock Baixo ({parts.filter((p) => p.quantity <= p.minQuantity && p.quantity > 0).length})
          </button>
          <button
            onClick={() => setFilterType('out')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterType === 'out'
                ? 'bg-red-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Esgotadas ({parts.filter((p) => p.quantity === 0).length})
          </button>
        </div>
      </div>

      {/* Parts Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Nome da Peça</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3 text-center">Stock Atual</th>
                <th className="px-4 py-3 text-right">Preço Unitário</th>
                <th className="px-4 py-3">Fornecedor</th>
                <th className="px-4 py-3 text-center">Ações / Ajuste</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredParts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                    Nenhuma peça encontrada com os critérios selecionados.
                  </td>
                </tr>
              ) : (
                filteredParts.map((part) => {
                  const isLow = part.quantity <= part.minQuantity && part.quantity > 0;
                  const isOut = part.quantity === 0;

                  return (
                    <tr key={part.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3.5 font-mono font-bold text-slate-900">
                        {part.code}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-900">{part.name}</div>
                        {isLow && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 font-bold mt-0.5">
                            <AlertTriangle className="w-3 h-3" />
                            Abaixo do mínimo ({part.minQuantity} un.)
                          </span>
                        )}
                        {isOut && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-red-700 font-bold mt-0.5">
                            <AlertCircle className="w-3 h-3" />
                            Stock Esgotado!
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px]">
                          {part.category}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`inline-block font-mono font-bold px-2.5 py-1 rounded-full text-xs ${
                            isOut
                              ? 'bg-red-100 text-red-800'
                              : isLow
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {part.quantity} un.
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-semibold text-slate-900">
                        {part.unitPrice.toLocaleString()} MT
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 text-[11px]">
                        {part.supplier || 'N/D'}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Botão de Ajuste Rápido */}
                          <button
                            onClick={() => {
                              setAdjustingPart(part);
                              setAdjustType('in');
                              setAdjustQty(5);
                              setAdjustReason('Reposição de stock');
                              setAdjustError('');
                            }}
                            title="Entrada de Stock (+)"
                            className="p-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setAdjustingPart(part);
                              setAdjustType('out');
                              setAdjustQty(1);
                              setAdjustReason('Saída manual');
                              setAdjustError('');
                            }}
                            title="Saída de Stock (-)"
                            className="p-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg transition"
                          >
                            <ArrowDownRight className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(part)}
                            title="Editar Peça"
                            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(part.id, part.name)}
                            title="Remover Peça"
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Registar / Editar Peça (CU07) */}
      {showPartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-500" />
                {editingPart ? 'Editar Peça de Stock' : 'Registar Nova Peça (CU07)'}
              </h3>
              <button onClick={() => setShowPartModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
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

            <form onSubmit={handlePartSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Código da Peça <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="Ex: FIL-OLEO-01"
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-amber-500 font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Categoria
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-amber-500 bg-white"
                  >
                    <option value="Filtros e Fluidos">Filtros e Fluidos</option>
                    <option value="Sistema de Travagem">Sistema de Travagem</option>
                    <option value="Motor">Motor</option>
                    <option value="Suspensão">Suspensão</option>
                    <option value="Eletricidade e Ignição">Eletricidade e Ignição</option>
                    <option value="Baterias e Elétrica">Baterias e Elétrica</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nome / Descrição da Peça <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Jogo de Pastilhas de Travão Dianteiras"
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Quantidade Inicial
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Stock Mínimo (Alerta)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={minQuantity}
                    onChange={(e) => setMinQuantity(Number(e.target.value))}
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Preço Unitário (MT)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={50}
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(Number(e.target.value))}
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Fornecedor
                </label>
                <input
                  type="text"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  placeholder="Ex: AutoPeças Moçambique Lda"
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPartModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 shadow transition"
                >
                  {editingPart ? 'Guardar Alterações' : 'Registar Peça'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Ajuste Manual de Entrada / Saída de Stock */}
      {adjustingPart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {adjustType === 'in' ? 'Entrada / Reposição de Stock' : 'Saída Manual de Stock'}
              </h3>
              <button
                onClick={() => setAdjustingPart(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs mb-4">
              <p className="font-bold text-slate-800">{adjustingPart.name}</p>
              <p className="text-slate-500 font-mono">Código: {adjustingPart.code} • Stock atual: {adjustingPart.quantity} un.</p>
            </div>

            {adjustError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{adjustError}</span>
              </div>
            )}

            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Quantidade a {adjustType === 'in' ? 'Adicionar' : 'Retirar'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(Number(e.target.value))}
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Motivo / Observação
                </label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder={adjustType === 'in' ? 'Ex: Compra NF 4022' : 'Ex: Peça danificada / descarte'}
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAdjustingPart(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow transition ${
                    adjustType === 'in' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-amber-600 hover:bg-amber-500'
                  }`}
                >
                  Confirmar {adjustType === 'in' ? 'Entrada' : 'Saída'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
