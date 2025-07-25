import CommunityBrowser from '@/components/CommunityBrowser';

export default function AdminCommunitiesPage() {
  return <CommunityBrowser showAdminView={true} userRole="sam" />;
}