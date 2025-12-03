"use client";

import { AppLayout } from "@/widgets/app-layout/ui/app-layout";
import { useAuthRedirect } from "@/shared/hooks/use-auth-redirect";
import { ParticipantsPage } from "@/widgets/participants-page/ui/participants-page";

export default function Page() {
  useAuthRedirect();

  return (
    <AppLayout>
      <ParticipantsPage />
    </AppLayout>
  );
}
