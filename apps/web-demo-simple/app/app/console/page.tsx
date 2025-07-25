import AppLayout from '@/components/layout/AppLayout';
import ServerManagementConsole from '@/components/ServerManagementConsole';

export default function AppConsolePage() {
  return (
    <AppLayout>
      <div className="-m-4 sm:-m-6 lg:-m-8">
        <ServerManagementConsole />
      </div>
    </AppLayout>
  );
}