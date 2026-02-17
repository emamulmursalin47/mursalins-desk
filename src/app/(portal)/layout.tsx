import { PortalDrawerProvider } from "@/contexts/portal-drawer-context";
import { PortalSidebar } from "@/components/layout/portal-sidebar";
import { PortalHeader } from "@/components/layout/portal-header";

export default function PortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <PortalDrawerProvider>
      <PortalSidebar />
      <div className="lg:pl-64">
        <PortalHeader />
        <main className="min-h-[calc(100dvh-3.5rem)] px-4 py-5 sm:p-6">
          {children}
        </main>
      </div>
    </PortalDrawerProvider>
  );
}
