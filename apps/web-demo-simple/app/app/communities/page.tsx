import AppLayout from '@/components/layout/AppLayout';
import CommunityBrowser from '@/components/CommunityBrowser';

export default function AppCommunitiesPage() {
  return (
    <AppLayout>
      <div className="-m-4 sm:-m-6 lg:-m-8">
        <CommunityBrowser />
      </div>
    </AppLayout>
  );
}