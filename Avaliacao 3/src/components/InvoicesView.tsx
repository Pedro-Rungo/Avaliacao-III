import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Invoice, ServiceOrder } from '../types';
import {
  Receipt,
  PlusCircle,
  Search,
  Printer,
  FileText,
  User,
  Car,
  Wrench,
  CheckCircle2,
  X,
  AlertCircle,
  Percent,
  CreditCard,
  Building2,
  Calendar,
} from 'lucide-react';

export const InvoicesView: React.FC = () => {
  const {
    invoices,
    serviceOrders,
    clients,
    vehicles,
    generateInvoice,
    getClientById,
    getVehicleById,
    getMechanicById,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedOSId, setSelectedOSId] = useState('');
  const [discount, setDiscount] = useState<number>(0);
  const [discountReason, setDiscountReason] = useState('');
  const [taxRate, setTaxRate] = useState<number>(16); // 16% IVA
  const [paymentMethod, setPaymentMethod] = useState<
    'Dinheiro' | 'Cartão / POS' | 'Transferência / M-Pesa' | 'Cheque'
  >('Transferência / M-Pesa');

  const [modalError, setModalError] = useState('');
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);

  // Ready OS for invoicing: either status 'Concluída' or not invoiced yet
  const availableOrders = serviceOrders.filter((os) => !os.invoiceId);

  const openGenerateModal = () => {
    // Prefer completed order
    const firstCompleted = availableOrders.find((os) => os.status === 'Concluída') || availableOrders[0];
    setSelectedOSId(firstCompleted ? firstCompleted.id : '');
    setDiscount(0);
    setDiscountReason('');
    setTaxRate(16);
    setPaymentMethod('Transferência / M-Pesa');
    setModalError('');
    setShowGenerateModal(true);
  };

  const handleGenerateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');

    if (!selectedOSId) {
      setModalError('Selecione uma Ordem de Serviço.');
      return;
    }

    const res = generateInvoice({
      serviceOrderId: selectedOSId,
      discount: Number(discount) || 0,
      discountReason: discountReason.trim(),
      taxRate: Number(taxRate) || 0,
      paymentMethod,
    });

    if (!res.success) {
      setModalError(res.message || 'Erro ao gerar fatura.');
      return;
    }

    setShowGenerateModal(false);
    // Open preview of the newly generated invoice
    const newInv = invoices.find((i) => i.id === res.invoiceId);
    if (newInv) setViewInvoice(newInv);
  };

  const currentSelectedOS = serviceOrders.find((o) => o.id === selectedOSId);
  const partsSubtotal = currentSelectedOS?.partsUsed.reduce((acc, p) => acc + p.total, 0) || 0;
  const laborSubtotal = currentSelectedOS?.laborCost || 0;
  const grossTotal = partsSubtotal + laborSubtotal;
  const discountedTotal = Math.max(0, grossTotal - (Number(discount) || 0));
  const calcTax = Math.round((discountedTotal * (Number(taxRate) || 0)) / 100);
  const finalCalculatedTotal = discountedTotal + calcTax;

  // Filtered invoices
  const filteredInvoices = invoices.filter((inv) => {
    const client = getClientById(inv.clientId);
    const vehicle = getVehicleById(inv.vehicleId);
    const term = searchTerm.toLowerCase();

    return (
      inv.id.toLowerCase().includes(term) ||
      inv.serviceOrderId.toLowerCase().includes(term) ||
      (client && client.name.toLowerCase().includes(term)) ||
      (vehicle && vehicle.plate.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Faturação e Orçamentos (CU08 / RF09)</h2>
            <p className="text-xs text-slate-500">
              Cálculo de mão de obra + peças, registo de descontos justificados e emissão de faturas
            </p>
          </div>
        </div>

        <button
          id="btn-emit-invoice"
          onClick={openGenerateModal}
          disabled={availableOrders.length === 0}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow transition w-full sm:w-auto ${
            availableOrders.length === 0
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          Emitir Nova Fatura
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Pesquisar por número de fatura, ordem de serviço, cliente ou matrícula..."
          className="w-full text-xs sm:text-sm bg-transparent outline-none text-slate-800 placeholder-slate-400"
        />
      </div>

      {/* Invoices List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredInvoices.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200 p-8">
            <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">Nenhuma fatura emitida ainda.</p>
            <p className="text-xs text-slate-400 mt-1">Conclua uma Ordem de Serviço para poder emitir a respetiva fatura.</p>
          </div>
        ) : (
          filteredInvoices.map((inv) => {
            const client = getClientById(inv.clientId);
            const vehicle = getVehicleById(inv.vehicleId);

            return (
              <div
                key={inv.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-amber-400 transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-black px-2.5 py-1 bg-slate-900 text-amber-400 rounded-md">
                        {inv.id}
                      </span>
                      <p className="text-xs text-slate-400 mt-1">Ref. {inv.serviceOrderId}</p>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {inv.status}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs pt-1 border-t border-slate-100">
                    <p className="font-bold text-slate-900">{client?.name}</p>
                    <p className="text-slate-600">
                      Viatura: {vehicle?.brand} {vehicle?.model} ({vehicle?.plate})
                    </p>
                    <p className="text-slate-400 text-[11px] flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Emitida em: {inv.issuedAt}
                    </p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs space-y-1">
                    <div className="flex justify-between text-slate-600">
                      <span>Peças ({inv.partsSubtotal.toLocaleString()} MT) + MO:</span>
                      <span className="font-mono">{(inv.partsSubtotal + inv.laborSubtotal).toLocaleString()} MT</span>
                    </div>
                    {inv.discount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-medium">
                        <span>Desconto concedido:</span>
                        <span className="font-mono">- {inv.discount.toLocaleString()} MT</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-500 text-[11px]">
                      <span>IVA ({inv.taxRate}%):</span>
                      <span className="font-mono">+{inv.taxAmount.toLocaleString()} MT</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200 text-sm">
                      <span>Total Liquidado:</span>
                      <span className="font-mono text-amber-600">{inv.total.toLocaleString()} MT</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium">
                    Pagamento: {inv.paymentMethod}
                  </span>
                  <button
                    onClick={() => setViewInvoice(inv)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Visualizar Fatura
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Emitir Fatura (CU08) */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-500" />
                Emitir Fatura da Ordem de Serviço (CU08)
              </h3>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleGenerateSubmit} className="overflow-y-auto space-y-4 pr-1 flex-1">
              {/* Seleção de OS */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Selecione a Ordem de Serviço a Faturar <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedOSId}
                  onChange={(e) => setSelectedOSId(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-amber-500 bg-white"
                >
                  {availableOrders.map((os) => {
                    const client = getClientById(os.clientId);
                    const vehicle = getVehicleById(os.vehicleId);
                    return (
                      <option key={os.id} value={os.id}>
                        {os.id} — {vehicle?.plate} ({client?.name}) [{os.status}]
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Resumo da OS selecionada */}
              {currentSelectedOS && (
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Subtotal de Peças ({currentSelectedOS.partsUsed.length} itens):</span>
                    <span className="font-mono font-bold text-slate-800">{partsSubtotal.toLocaleString()} MT</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Mão de Obra Mecânica:</span>
                    <span className="font-mono font-bold text-slate-800">{laborSubtotal.toLocaleString()} MT</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-slate-900">
                    <span>Subtotal Bruto:</span>
                    <span className="font-mono">{grossTotal.toLocaleString()} MT</span>
                  </div>
                </div>
              )}

              {/* Desconto e Regra CU08 */}
              <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-amber-900">
                    Desconto ou Ajuste Manual (MT)
                  </label>
                  <span className="text-[10px] text-amber-700 font-medium">Opcional</span>
                </div>
                <input
                  type="number"
                  min={0}
                  max={grossTotal}
                  step={50}
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  placeholder="0"
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-amber-300 rounded-xl outline-none focus:border-amber-500 bg-white font-mono"
                />

                {/* Justificativa obrigatória se houver desconto (CU08) */}
                {discount > 0 && (
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-amber-950">
                      Justificativa do Desconto <span className="text-red-600">* (Obrigatório CU08)</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={discountReason}
                      onChange={(e) => setDiscountReason(e.target.value)}
                      placeholder="Ex: Cliente VIP / Acordo de frota / Promoção do mês"
                      className="w-full text-xs px-3 py-2 border border-amber-300 rounded-xl outline-none focus:border-amber-500 bg-white"
                    />
                    <p className="text-[10px] text-amber-800">
                      Regra do Sistema: Qualquer desconto aplicado deve ser formalmente justificado para auditoria.
                    </p>
                  </div>
                )}
              </div>

              {/* IVA e Meio de Pagamento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Taxa de IVA (%)
                  </label>
                  <select
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-amber-500 bg-white"
                  >
                    <option value={16}>16% (IVA Padrão)</option>
                    <option value={0}>0% (Isento)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Método de Pagamento
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-amber-500 bg-white"
                  >
                    <option value="Transferência / M-Pesa">Transferência / M-Pesa</option>
                    <option value="Cartão / POS">Cartão / POS (Multicaixa)</option>
                    <option value="Dinheiro">Dinheiro Físico</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
              </div>

              {/* Total Final Calculado */}
              <div className="p-3.5 bg-slate-900 text-white rounded-xl text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total com Desconto:</span>
                  <span className="font-mono">{discountedTotal.toLocaleString()} MT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">IVA ({taxRate}%):</span>
                  <span className="font-mono">{calcTax.toLocaleString()} MT</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-800 font-bold text-base text-amber-400">
                  <span>Valor Final da Fatura:</span>
                  <span className="font-mono">{finalCalculatedTotal.toLocaleString()} MT</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 shadow transition"
                >
                  Confirmar e Emitir Fatura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Visualizar / Imprimir Fatura Formal */}
      {viewInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col justify-between">
            {/* Action buttons at top */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Documento Comercial / Fatura Recibo
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold shadow"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Imprimir
                </button>
                <button
                  onClick={() => setViewInvoice(null)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Formal Invoice Body */}
            <div className="space-y-6 text-slate-800">
              {/* Header: Workshop & Invoice Info */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Wrench className="w-6 h-6 text-amber-500" />
                    SGOM OFICINA AUTO
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Auto Mecânica Especializada • Maputo, Moçambique
                  </p>
                  <p className="text-xs text-slate-500">NUIT Oficina: 400 987 654 • Tel: +258 21 000 000</p>
                </div>

                <div className="text-left sm:text-right">
                  <div className="font-mono text-base font-black text-slate-900 bg-slate-100 px-3 py-1 rounded inline-block">
                    {viewInvoice.id}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Data: {viewInvoice.issuedAt}</p>
                  <p className="text-xs text-slate-500">Ref. OS: {viewInvoice.serviceOrderId}</p>
                  <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 mt-1">
                    ESTADO: LIQUIDADA ({viewInvoice.paymentMethod})
                  </span>
                </div>
              </div>

              {/* Client & Vehicle Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <h4 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider mb-1">
                    Dados do Cliente
                  </h4>
                  <p className="font-semibold text-slate-800">{getClientById(viewInvoice.clientId)?.name}</p>
                  <p className="text-slate-600">NUIT: {getClientById(viewInvoice.clientId)?.document}</p>
                  <p className="text-slate-600">Tel: {getClientById(viewInvoice.clientId)?.phone}</p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider mb-1">
                    Dados da Viatura
                  </h4>
                  <p className="font-semibold text-slate-800">
                    {getVehicleById(viewInvoice.vehicleId)?.brand} {getVehicleById(viewInvoice.vehicleId)?.model}
                  </p>
                  <p className="text-slate-600 font-mono font-bold">
                    Matrícula: {getVehicleById(viewInvoice.vehicleId)?.plate}
                  </p>
                  <p className="text-slate-600">
                    Ano: {getVehicleById(viewInvoice.vehicleId)?.year} • Km: {getVehicleById(viewInvoice.vehicleId)?.mileage.toLocaleString()} km
                  </p>
                </div>
              </div>

              {/* Items Breakdown Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Descrição dos Serviços e Peças</th>
                      <th className="p-3 text-center">Qtd</th>
                      <th className="p-3 text-right">Preço Unit.</th>
                      <th className="p-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {/* Mão de Obra */}
                    <tr>
                      <td className="p-3">
                        <p className="font-semibold text-slate-800">Mão de Obra e Diagnóstico Mecânico</p>
                        <p className="text-[10px] text-slate-500">Serviços técnicos executados na oficina</p>
                      </td>
                      <td className="p-3 text-center">1</td>
                      <td className="p-3 text-right font-mono">{viewInvoice.laborSubtotal.toLocaleString()} MT</td>
                      <td className="p-3 text-right font-mono font-semibold">{viewInvoice.laborSubtotal.toLocaleString()} MT</td>
                    </tr>

                    {/* Peças utilizadas na OS */}
                    {serviceOrders
                      .find((o) => o.id === viewInvoice.serviceOrderId)
                      ?.partsUsed.map((p, idx) => (
                        <tr key={idx}>
                          <td className="p-3">
                            <p className="font-semibold text-slate-800">{p.partName}</p>
                            <p className="text-[10px] text-slate-400 font-mono">Cód: {p.partCode}</p>
                          </td>
                          <td className="p-3 text-center">{p.quantity}</td>
                          <td className="p-3 text-right font-mono">{p.unitPrice.toLocaleString()} MT</td>
                          <td className="p-3 text-right font-mono font-semibold">{p.total.toLocaleString()} MT</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Total Breakdown */}
              <div className="flex justify-end">
                <div className="w-full sm:w-72 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal Peças:</span>
                    <span className="font-mono">{viewInvoice.partsSubtotal.toLocaleString()} MT</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Mão de Obra:</span>
                    <span className="font-mono">{viewInvoice.laborSubtotal.toLocaleString()} MT</span>
                  </div>
                  {viewInvoice.discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Desconto Aplicado:</span>
                      <span className="font-mono">- {viewInvoice.discount.toLocaleString()} MT</span>
                    </div>
                  )}
                  {viewInvoice.discountReason && (
                    <p className="text-[10px] text-slate-500 italic bg-slate-50 p-1.5 rounded">
                      Justificativa: {viewInvoice.discountReason}
                    </p>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>IVA ({viewInvoice.taxRate}%):</span>
                    <span className="font-mono">+{viewInvoice.taxAmount.toLocaleString()} MT</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-300 font-black text-base text-slate-900">
                    <span>TOTAL FATURADO:</span>
                    <span className="font-mono text-amber-600">{viewInvoice.total.toLocaleString()} MT</span>
                  </div>
                </div>
              </div>

              {/* Signature Area */}
              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200 text-center text-xs text-slate-500">
                <div>
                  <div className="border-b border-slate-400 w-48 mx-auto mb-1"></div>
                  <p>Pela Oficina (Assinatura / Carimbo)</p>
                </div>
                <div>
                  <div className="border-b border-slate-400 w-48 mx-auto mb-1"></div>
                  <p>O Cliente (Recebido e Conforme)</p>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setViewInvoice(null)}
                className="px-5 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
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
