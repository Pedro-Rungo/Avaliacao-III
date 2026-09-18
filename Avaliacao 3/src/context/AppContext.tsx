import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Client,
  Vehicle,
  Mechanic,
  Part,
  ServiceOrder,
  Invoice,
  SystemNotification,
  OSStatus,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_CLIENTS,
  INITIAL_VEHICLES,
  INITIAL_MECHANICS,
  INITIAL_PARTS,
  INITIAL_SERVICE_ORDERS,
  INITIAL_INVOICES,
  INITIAL_NOTIFICATIONS,
} from '../mockData';

export type NavTab =
  | 'dashboard'
  | 'clientes'
  | 'veiculos'
  | 'ordens'
  | 'mecanicos'
  | 'stock'
  | 'faturas'
  | 'utilizadores';

interface AppContextType {
  // Auth
  currentUser: User;
  users: User[];
  setCurrentUser: (user: User) => void;
  login: (email: string, role?: string) => boolean;
  logout: () => void;
  quickSwitchUser: (role: 'admin' | 'atendente' | 'mecanico', mechanicId?: string) => void;

  // Navigation
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  globalSearch: string;
  setGlobalSearch: (search: string) => void;

  // Clientes
  clients: Client[];
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => { success: boolean; message?: string };
  updateClient: (id: string, data: Partial<Client>) => { success: boolean; message?: string };
  deleteClient: (id: string) => { success: boolean; message?: string };

  // Veículos
  vehicles: Vehicle[];
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'createdAt'>) => { success: boolean; message?: string };
  updateVehicle: (id: string, data: Partial<Vehicle>) => { success: boolean; message?: string };
  deleteVehicle: (id: string) => { success: boolean; message?: string };

  // Mecânicos
  mechanics: Mechanic[];
  addMechanic: (mechanic: Omit<Mechanic, 'id'>) => { success: boolean; message?: string };
  updateMechanic: (id: string, data: Partial<Mechanic>) => { success: boolean; message?: string };
  deleteMechanic: (id: string) => { success: boolean; message?: string; canInactivate?: boolean };

  // Peças e Stock
  parts: Part[];
  addPart: (part: Omit<Part, 'id'>) => { success: boolean; message?: string };
  updatePart: (id: string, data: Partial<Part>) => { success: boolean; message?: string };
  adjustStock: (partId: string, quantityChange: number, reason: string) => { success: boolean; message?: string };
  deletePart: (id: string) => { success: boolean; message?: string };

  // Ordens de Serviço
  serviceOrders: ServiceOrder[];
  addServiceOrder: (data: {
    clientId: string;
    vehicleId: string;
    mechanicId?: string;
    problemDescription: string;
    laborCost?: number;
  }) => { success: boolean; message?: string; osId?: string };
  updateServiceOrder: (id: string, data: Partial<ServiceOrder>) => { success: boolean; message?: string };
  updateOSStatus: (id: string, status: OSStatus) => { success: boolean; message?: string };
  addPartToOS: (osId: string, partId: string, quantity: number) => { success: boolean; message?: string };
  removePartFromOS: (osId: string, partId: string) => { success: boolean; message?: string };

  // Faturas
  invoices: Invoice[];
  generateInvoice: (data: {
    serviceOrderId: string;
    discount?: number;
    discountReason?: string;
    taxRate?: number;
    paymentMethod: 'Dinheiro' | 'Cartão / POS' | 'Transferência / M-Pesa' | 'Cheque';
  }) => { success: boolean; message?: string; invoiceId?: string };

  // Notificações
  notifications: SystemNotification[];
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;

  // Utilitários
  getClientById: (id: string) => Client | undefined;
  getVehicleById: (id: string) => Vehicle | undefined;
  getMechanicById: (id?: string) => Mechanic | undefined;
  getVehicleHistory: (vehicleId: string) => ServiceOrder[];
  resetToDefaultData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USERS: 'sgom_users_v1',
  CURRENT_USER: 'sgom_current_user_v1',
  CLIENTS: 'sgom_clients_v1',
  VEHICLES: 'sgom_vehicles_v1',
  MECHANICS: 'sgom_mechanics_v1',
  PARTS: 'sgom_parts_v1',
  OS: 'sgom_os_v1',
  INVOICES: 'sgom_invoices_v1',
  NOTIFICATIONS: 'sgom_notifications_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Inicialização do LocalStorage com fallback para os mocks
  const [users] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return saved ? JSON.parse(saved) : INITIAL_USERS[0]; // Inicia como Admin por padrão
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VEHICLES);
    return saved ? JSON.parse(saved) : INITIAL_VEHICLES;
  });

  const [mechanics, setMechanics] = useState<Mechanic[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MECHANICS);
    return saved ? JSON.parse(saved) : INITIAL_MECHANICS;
  });

  const [parts, setParts] = useState<Part[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PARTS);
    return saved ? JSON.parse(saved) : INITIAL_PARTS;
  });

  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.OS);
    return saved ? JSON.parse(saved) : INITIAL_SERVICE_ORDERS;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INVOICES);
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  const [notifications, setNotifications] = useState<SystemNotification[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [globalSearch, setGlobalSearch] = useState<string>('');

  // Persistência automática no localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MECHANICS, JSON.stringify(mechanics));
  }, [mechanics]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PARTS, JSON.stringify(parts));
  }, [parts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.OS, JSON.stringify(serviceOrders));
  }, [serviceOrders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  // Auth Helpers
  const login = (email: string) => {
    const found = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (found) {
      setCurrentUser(found);
      return true;
    }
    return false;
  };

  const logout = () => {
    // Retorna para o utilizador padrão atendente ou admin
    setCurrentUser(INITIAL_USERS[0]);
  };

  const quickSwitchUser = (role: 'admin' | 'atendente' | 'mecanico', mechanicId?: string) => {
    let target = users.find((u) => u.role === role);
    if (role === 'mecanico' && mechanicId) {
      const specific = users.find((u) => u.mechanicId === mechanicId);
      if (specific) target = specific;
    }
    if (target) {
      setCurrentUser(target);
    }
  };

  // Helper Lookups
  const getClientById = (id: string) => clients.find((c) => c.id === id);
  const getVehicleById = (id: string) => vehicles.find((v) => v.id === id);
  const getMechanicById = (id?: string) => mechanics.find((m) => m.id === id);
  const getVehicleHistory = (vehicleId: string) =>
    serviceOrders.filter((os) => os.vehicleId === vehicleId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  // Clientes CRUD (RF02 / CU02)
  const addClient = (clientData: Omit<Client, 'id' | 'createdAt'>) => {
    // Validação de documento único (NUIT duplicado)
    const docClean = clientData.document.trim().toLowerCase();
    const exists = clients.some((c) => c.document.trim().toLowerCase() === docClean);
    if (exists) {
      return {
        success: false,
        message: `Atenção: Já existe um cliente cadastrado com o NUIT/Documento "${clientData.document}". Cadastro bloqueado para evitar duplicidade.`,
      };
    }

    const newClient: Client = {
      ...clientData,
      id: `cli-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setClients((prev) => [newClient, ...prev]);
    return { success: true, message: 'Cliente cadastrado com sucesso!' };
  };

  const updateClient = (id: string, data: Partial<Client>) => {
    if (data.document) {
      const docClean = data.document.trim().toLowerCase();
      const duplicate = clients.some((c) => c.id !== id && c.document.trim().toLowerCase() === docClean);
      if (duplicate) {
        return {
          success: false,
          message: `Já existe outro cliente cadastrado com o NUIT/Documento "${data.document}".`,
        };
      }
    }
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
    return { success: true, message: 'Dados do cliente atualizados com sucesso!' };
  };

  const deleteClient = (id: string) => {
    // Verifica se possui veículos cadastrados
    const clientVehicles = vehicles.filter((v) => v.clientId === id);
    if (clientVehicles.length > 0) {
      return {
        success: false,
        message: `Não é possível remover este cliente pois ele possui ${clientVehicles.length} veículo(s) cadastrado(s). Remova os veículos primeiro.`,
      };
    }
    setClients((prev) => prev.filter((c) => c.id !== id));
    return { success: true, message: 'Cliente removido com sucesso!' };
  };

  // Veículos CRUD (RF03 / CU03)
  const addVehicle = (vehicleData: Omit<Vehicle, 'id' | 'createdAt'>) => {
    // Validação de matrícula única
    const plateClean = vehicleData.plate.trim().toUpperCase();
    const exists = vehicles.some((v) => v.plate.trim().toUpperCase() === plateClean);
    if (exists) {
      return {
        success: false,
        message: `Atenção: A matrícula "${vehicleData.plate}" já está cadastrada no sistema. Não são permitidas matrículas duplicadas.`,
      };
    }

    const newVehicle: Vehicle = {
      ...vehicleData,
      plate: plateClean,
      id: `veh-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setVehicles((prev) => [newVehicle, ...prev]);
    return { success: true, message: 'Veículo associado ao cliente com sucesso!' };
  };

  const updateVehicle = (id: string, data: Partial<Vehicle>) => {
    if (data.plate) {
      const plateClean = data.plate.trim().toUpperCase();
      const exists = vehicles.some((v) => v.id !== id && v.plate.trim().toUpperCase() === plateClean);
      if (exists) {
        return {
          success: false,
          message: `A matrícula "${data.plate}" já pertence a outro veículo registado.`,
        };
      }
      data.plate = plateClean;
    }
    setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, ...data } : v)));
    return { success: true, message: 'Dados do veículo atualizados com sucesso!' };
  };

  const deleteVehicle = (id: string) => {
    const hasOS = serviceOrders.some((os) => os.vehicleId === id);
    if (hasOS) {
      return {
        success: false,
        message: 'Este veículo possui histórico de Ordens de Serviço e não pode ser excluído para preservar o histórico.',
      };
    }
    setVehicles((prev) => prev.filter((v) => v.id !== id));
    return { success: true, message: 'Veículo removido com sucesso.' };
  };

  // Mecânicos CRUD (RF06 / CU06)
  const addMechanic = (data: Omit<Mechanic, 'id'>) => {
    const newMec: Mechanic = {
      ...data,
      id: `mec-${Date.now()}`,
    };
    setMechanics((prev) => [...prev, newMec]);
    return { success: true, message: 'Técnico/Mecânico cadastrado com sucesso!' };
  };

  const updateMechanic = (id: string, data: Partial<Mechanic>) => {
    setMechanics((prev) => prev.map((m) => (m.id === id ? { ...m, ...data } : m)));
    return { success: true, message: 'Dados do mecânico atualizados!' };
  };

  const deleteMechanic = (id: string) => {
    // Regra do documento CU06:
    // "Fluxo alternativo: Se o mecânico tiver OS em aberto, o sistema impede a remoção e sugere apenas inativação"
    const openOS = serviceOrders.filter(
      (os) => os.mechanicId === id && (os.status === 'Pendente' || os.status === 'Em execução' || os.status === 'Aguardando peça')
    );

    if (openOS.length > 0) {
      return {
        success: false,
        canInactivate: true,
        message: `O mecânico possui ${openOS.length} Ordem(ns) de Serviço em aberto! De acordo com as regras do sistema, ele não pode ser removido, apenas inativado.`,
      };
    }

    setMechanics((prev) => prev.filter((m) => m.id !== id));
    return { success: true, message: 'Mecânico removido com sucesso.' };
  };

  // Peças & Stock (RF07, CU07)
  const addPart = (partData: Omit<Part, 'id'>) => {
    const codeClean = partData.code.trim().toUpperCase();
    const exists = parts.some((p) => p.code.trim().toUpperCase() === codeClean);
    if (exists) {
      return {
        success: false,
        message: `Já existe uma peça cadastrada com o código "${partData.code}".`,
      };
    }
    const newPart: Part = {
      ...partData,
      code: codeClean,
      id: `part-${Date.now()}`,
    };
    setParts((prev) => [...prev, newPart]);
    return { success: true, message: 'Nova peça registada no stock!' };
  };

  const updatePart = (id: string, data: Partial<Part>) => {
    setParts((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
    return { success: true, message: 'Dados da peça atualizados.' };
  };

  const adjustStock = (partId: string, quantityChange: number, reason: string) => {
    const part = parts.find((p) => p.id === partId);
    if (!part) return { success: false, message: 'Peça não encontrada.' };

    const newQty = part.quantity + quantityChange;
    if (newQty < 0) {
      return {
        success: false,
        message: `Stock insuficiente. Quantidade atual: ${part.quantity}. Não é possível retirar ${Math.abs(quantityChange)}.`,
      };
    }

    setParts((prev) => prev.map((p) => (p.id === partId ? { ...p, quantity: newQty } : p)));

    // Se atingiu stock mínimo ou zero, gera alerta
    if (newQty <= part.minQuantity) {
      const alertNotif: SystemNotification = {
        id: `notif-${Date.now()}`,
        title: 'Alerta de Stock Crítico',
        message: `A peça "${part.name}" está com stock baixo (${newQty} unidades disponíveis). Reposição necessária. Motivo: ${reason}`,
        type: 'warning',
        date: new Date().toLocaleDateString('pt-PT'),
        read: false,
      };
      setNotifications((prev) => [alertNotif, ...prev]);
    }

    return {
      success: true,
      message: `Stock de "${part.name}" atualizado para ${newQty} unidades.`,
    };
  };

  const deletePart = (id: string) => {
    const usedInOS = serviceOrders.some((os) => os.partsUsed.some((p) => p.partId === id));
    if (usedInOS) {
      return {
        success: false,
        message: 'Esta peça já foi utilizada em Ordens de Serviço e não pode ser excluída para garantir a integridade dos relatórios.',
      };
    }
    setParts((prev) => prev.filter((p) => p.id !== id));
    return { success: true, message: 'Peça excluída do stock.' };
  };

  // Ordens de Serviço (RF04, RF05, RF08, CU04, CU05)
  const addServiceOrder = (data: {
    clientId: string;
    vehicleId: string;
    mechanicId?: string;
    problemDescription: string;
    laborCost?: number;
  }) => {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const nextNumber = serviceOrders.length + 1;
    const osId = `OS-2026-${String(nextNumber).padStart(3, '0')}`;

    const newOS: ServiceOrder = {
      id: osId,
      clientId: data.clientId,
      vehicleId: data.vehicleId,
      mechanicId: data.mechanicId,
      problemDescription: data.problemDescription,
      status: 'Pendente',
      createdAt: formattedDate,
      laborCost: data.laborCost || 1500,
      partsUsed: [],
    };

    setServiceOrders((prev) => [newOS, ...prev]);

    // Notificação automática
    const client = getClientById(data.clientId);
    const vehicle = getVehicleById(data.vehicleId);
    const notif: SystemNotification = {
      id: `notif-${Date.now()}`,
      title: 'Nova Ordem de Serviço Aberta',
      message: `${osId} aberta para o veículo ${vehicle?.brand} ${vehicle?.model} (${vehicle?.plate}) do cliente ${client?.name}.`,
      type: 'info',
      date: new Date().toLocaleDateString('pt-PT'),
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);

    return { success: true, message: `Ordem de Serviço ${osId} registada com sucesso!`, osId };
  };

  const updateServiceOrder = (id: string, data: Partial<ServiceOrder>) => {
    setServiceOrders((prev) => prev.map((os) => (os.id === id ? { ...os, ...data } : os)));
    return { success: true, message: 'Ordem de serviço atualizada!' };
  };

  const updateOSStatus = (id: string, status: OSStatus) => {
    const os = serviceOrders.find((o) => o.id === id);
    if (!os) return { success: false, message: 'Ordem de serviço não encontrada.' };

    const updates: Partial<ServiceOrder> = { status };
    if (status === 'Concluída' && !os.completedAt) {
      const now = new Date();
      updates.completedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    }

    setServiceOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...updates } : o)));

    // Regra do documento CU05:
    // "Fluxo alternativo: Se faltar uma peça em stock, o mecânico marca a OS como 'Aguardando peça' e o sistema notifica o administrador"
    if (status === 'Aguardando peça') {
      const notif: SystemNotification = {
        id: `notif-${Date.now()}`,
        title: `Atenção Admin: ${id} Aguardando Peças`,
        message: `A Ordem de Serviço ${id} foi sinalizada como "Aguardando peça" pelo mecânico. Verifique a aquisição das peças necessárias.`,
        type: 'warning',
        date: new Date().toLocaleDateString('pt-PT'),
        read: false,
      };
      setNotifications((prev) => [notif, ...prev]);
    }

    return { success: true, message: `Estado da ${id} alterado para "${status}".` };
  };

  // RF08 & CU07: Associar peças utilizadas com baixa automática no stock
  const addPartToOS = (osId: string, partId: string, quantity: number) => {
    if (quantity <= 0) {
      return { success: false, message: 'A quantidade deve ser maior que zero.' };
    }

    const part = parts.find((p) => p.id === partId);
    if (!part) return { success: false, message: 'Peça não encontrada.' };

    // Regra CU07:
    // "Fluxo alternativo: Se a quantidade solicitada for maior que o stock disponível, o sistema bloqueia a saída e alerta"
    if (quantity > part.quantity) {
      return {
        success: false,
        message: `BLOQUEADO: Quantidade insuficiente em stock! Disponível: ${part.quantity} unidade(s). Solicitado: ${quantity} unidade(s).`,
      };
    }

    // 1. Dá baixa automática no stock
    adjustStock(partId, -quantity, `Utilizado na OS ${osId}`);

    // 2. Adiciona à lista de peças da OS
    setServiceOrders((prev) =>
      prev.map((os) => {
        if (os.id !== osId) return os;
        const existingItemIndex = os.partsUsed.findIndex((p) => p.partId === partId);
        let newPartsList = [...os.partsUsed];

        if (existingItemIndex >= 0) {
          const item = newPartsList[existingItemIndex];
          const newQty = item.quantity + quantity;
          newPartsList[existingItemIndex] = {
            ...item,
            quantity: newQty,
            total: newQty * item.unitPrice,
          };
        } else {
          newPartsList.push({
            partId: part.id,
            partName: part.name,
            partCode: part.code,
            quantity: quantity,
            unitPrice: part.unitPrice,
            total: quantity * part.unitPrice,
          });
        }
        return { ...os, partsUsed: newPartsList };
      })
    );

    return {
      success: true,
      message: `${quantity}x ${part.name} adicionada(s) à OS e debitada(s) do stock com sucesso!`,
    };
  };

  const removePartFromOS = (osId: string, partId: string) => {
    const os = serviceOrders.find((o) => o.id === osId);
    if (!os) return { success: false, message: 'OS não encontrada.' };

    const item = os.partsUsed.find((p) => p.partId === partId);
    if (!item) return { success: false, message: 'Item não encontrado na OS.' };

    // Devolve para o stock
    adjustStock(partId, item.quantity, `Estorno/remoção da OS ${osId}`);

    setServiceOrders((prev) =>
      prev.map((o) => {
        if (o.id !== osId) return o;
        return {
          ...o,
          partsUsed: o.partsUsed.filter((p) => p.partId !== partId),
        };
      })
    );

    return {
      success: true,
      message: `${item.partName} removida da OS e retornada ao stock.`,
    };
  };

  // Faturas e Orçamentos (RF09, CU08)
  const generateInvoice = (data: {
    serviceOrderId: string;
    discount?: number;
    discountReason?: string;
    taxRate?: number;
    paymentMethod: 'Dinheiro' | 'Cartão / POS' | 'Transferência / M-Pesa' | 'Cheque';
  }) => {
    const os = serviceOrders.find((o) => o.id === data.serviceOrderId);
    if (!os) return { success: false, message: 'Ordem de serviço não encontrada.' };

    const discount = Number(data.discount) || 0;
    // Regra CU08:
    // "Fluxo alternativo: Se houver desconto ou ajuste manual, o atendente regista a justificativa antes de confirmar"
    if (discount > 0 && (!data.discountReason || data.discountReason.trim() === '')) {
      return {
        success: false,
        message: 'Atenção: Ao aplicar um desconto ou ajuste, é obrigatório preencher a justificativa conforme as normas do sistema.',
      };
    }

    const partsSubtotal = os.partsUsed.reduce((acc, p) => acc + p.total, 0);
    const laborSubtotal = os.laborCost || 0;
    const grossSubtotal = partsSubtotal + laborSubtotal;

    if (discount > grossSubtotal) {
      return {
        success: false,
        message: 'O valor do desconto não pode ser superior ao valor total dos serviços e peças.',
      };
    }

    const discountedSubtotal = grossSubtotal - discount;
    const taxRate = data.taxRate !== undefined ? data.taxRate : 16; // 16% padrão
    const taxAmount = Math.round((discountedSubtotal * taxRate) / 100);
    const total = discountedSubtotal + taxAmount;

    const nextInvoiceNum = invoices.length + 1;
    const invoiceId = `FAT-2026-${String(nextInvoiceNum).padStart(3, '0')}`;
    const now = new Date();
    const issuedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newInvoice: Invoice = {
      id: invoiceId,
      serviceOrderId: os.id,
      clientId: os.clientId,
      vehicleId: os.vehicleId,
      issuedAt,
      partsSubtotal,
      laborSubtotal,
      discount,
      discountReason: data.discountReason,
      taxRate,
      taxAmount,
      total,
      paymentMethod: data.paymentMethod,
      status: 'Paga',
    };

    setInvoices((prev) => [newInvoice, ...prev]);

    // Vincula a fatura à OS e marca como concluída se ainda não estiver
    setServiceOrders((prev) =>
      prev.map((o) => (o.id === os.id ? { ...o, invoiceId, status: 'Concluída', completedAt: o.completedAt || issuedAt } : o))
    );

    const notif: SystemNotification = {
      id: `notif-${Date.now()}`,
      title: 'Fatura Emitida',
      message: `Fatura ${invoiceId} gerada com sucesso para a Ordem de Serviço ${os.id}. Valor total: ${total.toLocaleString()} MT.`,
      type: 'success',
      date: new Date().toLocaleDateString('pt-PT'),
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);

    return { success: true, message: `Fatura ${invoiceId} emitida com sucesso!`, invoiceId };
  };

  // Notificações
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Reset para dados originais
  const resetToDefaultData = () => {
    localStorage.clear();
    setClients(INITIAL_CLIENTS);
    setVehicles(INITIAL_VEHICLES);
    setMechanics(INITIAL_MECHANICS);
    setParts(INITIAL_PARTS);
    setServiceOrders(INITIAL_SERVICE_ORDERS);
    setInvoices(INITIAL_INVOICES);
    setNotifications(INITIAL_NOTIFICATIONS);
    setCurrentUser(INITIAL_USERS[0]);
    setActiveTab('dashboard');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        setCurrentUser,
        login,
        logout,
        quickSwitchUser,
        activeTab,
        setActiveTab,
        globalSearch,
        setGlobalSearch,
        clients,
        addClient,
        updateClient,
        deleteClient,
        vehicles,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        mechanics,
        addMechanic,
        updateMechanic,
        deleteMechanic,
        parts,
        addPart,
        updatePart,
        adjustStock,
        deletePart,
        serviceOrders,
        addServiceOrder,
        updateServiceOrder,
        updateOSStatus,
        addPartToOS,
        removePartFromOS,
        invoices,
        generateInvoice,
        notifications,
        markNotificationAsRead,
        clearAllNotifications,
        getClientById,
        getVehicleById,
        getMechanicById,
        getVehicleHistory,
        resetToDefaultData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser utilizado dentro de AppProvider');
  }
  return context;
};
