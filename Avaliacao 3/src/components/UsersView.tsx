import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, UserCheck, Users, Check, X, LogIn, Lock } from 'lucide-react';

export const UsersView: React.FC = () => {
  const { users, currentUser, setCurrentUser } = useApp();

  const permissionsMatrix = [
    { module: 'Autenticação & Login (CU01 / RF01)', admin: true, atendente: true, mecanico: true },
    { module: 'CRUD de Clientes (CU02 / RF02)', admin: true, atendente: true, mecanico: false },
    { module: 'CRUD de Veículos (CU03 / RF03)', admin: true, atendente: true, mecanico: false },
    { module: 'Registar Ordem de Serviço (CU04 / RF04)', admin: true, atendente: true, mecanico: false },
    { module: 'Atualizar Estado da OS (CU05 / RF05)', admin: true, atendente: false, mecanico: true },
    { module: 'Associar Peças com Baixa de Stock (CU07 / RF08)', admin: true, atendente: false, mecanico: true },
    { module: 'CRUD de Mecânicos/Técnicos (CU06 / RF06)', admin: true, atendente: false, mecanico: false },
    { module: 'Gerir Stock de Peças & Entradas (CU07 / RF07)', admin: true, atendente: false, mecanico: false },
    { module: 'Gerar Faturas & Orçamentos (CU08 / RF09)', admin: true, atendente: true, mecanico: false },
    { module: 'Consultar Histórico por Veículo (RF10)', admin: true, atendente: true, mecanico: true },
    { module: 'Gerir Permissões de Utilizadores (RF11)', admin: true, atendente: false, mecanico: false },
    { module: 'Pesquisa Global de Dados (RF12)', admin: true, atendente: true, mecanico: true },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Utilizadores e Controlo de Acesso (RF11)</h2>
            <p className="text-xs text-slate-500">
              Perfis de utilizador, papéis no sistema e matriz de permissões por ator (SGOM)
            </p>
          </div>
        </div>
      </div>

      {/* Users List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {users.map((u) => {
          const isCurrent = currentUser.id === u.id;

          return (
            <div
              key={u.id}
              className={`bg-white border rounded-xl p-5 shadow-sm transition flex flex-col justify-between ${
                isCurrent ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-200'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full ${u.avatarColor} text-white font-bold text-sm flex items-center justify-center shadow`}
                  >
                    {u.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-tight">{u.name}</h3>
                    <span className="text-[10px] text-amber-700 font-semibold px-2 py-0.5 rounded bg-amber-50 inline-block mt-0.5">
                      {u.roleLabel}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 space-y-1 pt-1 border-t border-slate-100">
                  <p className="truncate text-slate-500">Email: {u.email}</p>
                  <p className="text-slate-500 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-slate-400" />
                    Perfil: <strong className="capitalize text-slate-700">{u.role}</strong>
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                {isCurrent ? (
                  <span className="block text-center text-xs font-bold text-amber-600 py-1.5 bg-amber-50 rounded-lg">
                    Sessão Ativa Agora
                  </span>
                ) : (
                  <button
                    onClick={() => setCurrentUser(u)}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    Entrar como este Utilizador
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Permissions Matrix Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Matriz de Permissões por Ator (Conforme Documento de Requisitos)
          </h3>
          <p className="text-xs text-slate-500">
            Mapeamento dos 3 atores do sistema com base nos Casos de Uso CU01 até CU08
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                <th className="p-3">Funcionalidade / Requisito</th>
                <th className="p-3 text-center">Administrador</th>
                <th className="p-3 text-center">Atendente / Recepcionista</th>
                <th className="p-3 text-center">Mecânico / Técnico</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {permissionsMatrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-3 font-medium text-slate-800">{row.module}</td>
                  <td className="p-3 text-center">
                    {row.admin ? (
                      <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-300 mx-auto" />
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {row.atendente ? (
                      <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-300 mx-auto" />
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {row.mecanico ? (
                      <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-300 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
