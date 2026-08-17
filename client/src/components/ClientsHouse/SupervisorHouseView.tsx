import HouseView from './HouseView';
import { isSupervisorHouseMember } from '../../lib/houseLayout';

const SupervisorHouseView = () => <HouseView filter={isSupervisorHouseMember} />;

export default SupervisorHouseView;
