import { AppLayout } from './AppLayout';
import ClientsHouseView from '../components/ClientsHouse/ClientsHouseView';

export const ClientsHousePage = () => (
  <AppLayout>
    <div style={{ height: '100%', width: '100%' }}>
      <ClientsHouseView />
    </div>
  </AppLayout>
);
