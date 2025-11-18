import { ReactNode } from "react";
import { AppFooter } from "@/widgets/app-footer/ui/app-footer";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-cyan-100 pb-20">
      {children}
      <AppFooter />
    </div>
  );
}

