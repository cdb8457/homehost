import AppLayout from '@/components/layout/AppLayout';
import MinimalGameLibrary from '@/components/MinimalGameLibrary';

export default function AppGamesPage() {
  return (
    <AppLayout>
      <div className="-m-4 sm:-m-6 lg:-m-8">
        <MinimalGameLibrary />
      </div>
    </AppLayout>
  );
}