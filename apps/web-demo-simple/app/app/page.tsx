import DashboardOverview from '@/components/dashboard/DashboardOverview';
import { MOCK_USER } from '@/data/app';

export default function AppDashboard() {
  return (
    <DashboardOverview user={MOCK_USER} />
  );
}