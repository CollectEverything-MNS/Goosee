import AdminSidebar from '@/components/layout/admin-sidebar';
import { AdminHeader } from '@/components/layout/admin-header';

interface Props {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: Props) {
  return (
    <div className={"flex min-h-screen"}>
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <main className="flex-1 p-6 bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
}