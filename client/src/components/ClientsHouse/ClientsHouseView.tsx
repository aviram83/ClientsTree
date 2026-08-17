import HouseView from './HouseView';
import { isClientsHouseMember } from '../../lib/houseLayout';

const ClientsHouseView = () => <HouseView filter={isClientsHouseMember} />;

export default ClientsHouseView;
