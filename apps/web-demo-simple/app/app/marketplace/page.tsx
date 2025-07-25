import AppLayout from '@/components/layout/AppLayout';
import PluginMarketplace from '@/components/PluginMarketplace';

export default function AppMarketplacePage() {
  return (
    <AppLayout>
      <div className="-m-4 sm:-m-6 lg:-m-8">
        <PluginMarketplace userType="both" />
      </div>
    </AppLayout>
  );
}