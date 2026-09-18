export type UserRole = 'admin' | 'atendente' | 'mecanico';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  avatarColor: string;
  mechanicId?: string; // se for mecânico, vinculado ao ID do mecânico
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  document: string; // NUIT / BI / NIF
  createdAt: string;
}

export interface Vehicle {
  id: string;
  clientId: string;
  plate: string; // Matrícula (única)
  brand: string;
  model: string;
  year: number;
  color: string;
  mileage: number;
  createdAt: string;
}

export interface Mechanic {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  email: string;
  status: 'ativo' | 'inativo';
}

export interface Part {
  id: string;
  code: string; // Código de referência
  name: string;
  category: string;
  quantity: number;
  minQuantity: number; // Estoque mínimo de alerta
  unitPrice: number;
  supplier: string;
}

export type OSStatus = 'Pendente' | 'Em execução' | 'Aguardando peça' | 'Concluída';

export interface OSPartItem {
  partId: string;
  partName: string;
  partCode: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ServiceOrder {
  id: string; // Ex: OS-2026-001
  clientId: string;
  vehicleId: string;
  mechanicId?: string;
  problemDescription: string;
  diagnosis?: string;
  status: OSStatus;
  createdAt: string;
  completedAt?: string;
  laborCost: number; // Mão de obra
  partsUsed: OSPartItem[];
  invoiceId?: string;
  notes?: string;
}

export interface Invoice {
  id: string; // Ex: FAT-2026-001
  serviceOrderId: string;
  clientId: string;
  vehicleId: string;
  issuedAt: string;
  partsSubtotal: number;
  laborSubtotal: number;
  discount: number;
  discountReason?: string;
  taxRate: number; // Ex: 16% (IVA) ou 0%
  taxAmount: number;
  total: number;
  paymentMethod: 'Dinheiro' | 'Cartão / POS' | 'Transferência / M-Pesa' | 'Cheque';
  status: 'Paga' | 'Pendente';
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  date: string;
  read: boolean;
}
