"use client";

import { AppLayout } from "@/widgets/app-layout/ui/app-layout";
import { useAuthRedirect } from "@/shared/hooks/use-auth-redirect";
import { StampsPage } from "@/widgets/stamps-page/ui/stamps-page";

export default function Page() {
  useAuthRedirect();

  return (
    <AppLayout>
      <StampsPage />
    </AppLayout>
  );
}
