import React from 'react';
import { useApp } from '../context/AppContext';
import { DashboardView } from './DashboardView';
import { ClientsView } from './ClientsView';
import { VehiclesView } from './VehiclesView';
import { ServiceOrdersView } from './ServiceOrdersView';
import { StockView } from './StockView';
import { InvoicesView } from './InvoicesView';
import { MechanicsView } from './MechanicsView';
import { UsersView } from './UsersView';

export const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {activeTab === 'dashboard' && <DashboardView />}
      {activeTab === 'clientes' && <ClientsView />}
      {activeTab === 'veiculos' && <VehiclesView />}
      {activeTab === 'ordens' && <ServiceOrdersView />}
      {activeTab === 'stock' && <StockView />}
      {activeTab === 'faturas' && <InvoicesView />}
      {activeTab === 'mecanicos' && <MechanicsView />}
      {activeTab === 'utilizadores' && <UsersView />}
    </main>
  );
};
