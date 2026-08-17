import { AppLayout } from './AppLayout';
import SupervisorHouseView from '../components/ClientsHouse/SupervisorHouseView';

export const SupervisorHousePage = () => (
  <AppLayout>
    <div style={{ height: '100%', width: '100%' }}>
      <SupervisorHouseView />
    </div>
  </AppLayout>
);
