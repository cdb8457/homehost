import AppLayout from '@/components/layout/AppLayout';
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import { ALEX_USER } from '@/data/app';

export default function AlexDashboard() {
  return (
    <AppLayout userType="alex">
      <DashboardOverview user={ALEX_USER} />
    </AppLayout>
  );
}