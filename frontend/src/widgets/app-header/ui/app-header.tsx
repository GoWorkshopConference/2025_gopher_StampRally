import { ReactNode } from "react";
import { Badge } from "@/shared/ui/badge";

interface AppHeaderProps {
  title: string;
  icon?: ReactNode;
  badge?: string;
  action?: ReactNode;
  children?: ReactNode;
}

export function AppHeader({ title, icon, badge, action, children }: AppHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white p-6 shadow-lg">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-4 gap-3">
          <h1 className="flex items-center gap-2">
            {icon}
            {title}
          </h1>
          <div className="flex items-center gap-3">
            {badge && (
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                {badge}
              </Badge>
            )}
            {action}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

