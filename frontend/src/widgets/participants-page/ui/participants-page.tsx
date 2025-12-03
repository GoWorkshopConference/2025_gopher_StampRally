"use client";

import { AppHeader } from "@/widgets/app-header/ui/app-header";
import { ParticipantsList } from "@/widgets/participants-list/ui/participants-list";
import { ParticipantDetail } from "@/widgets/participant-detail/ui/participant-detail";
import { Users } from "lucide-react";
import { LoadingSpinner } from "@/shared/ui/loading-spinner";
import { useParticipants } from "@/shared/hooks/use-participants";

export function ParticipantsPage() {
  const { participants, isLoading, selectedParticipant, isDetailOpen, handleParticipantClick, handleCloseDetail } = useParticipants();

  if (isLoading) {
    return (
      <>
        <AppHeader title="参加者一覧" icon={<Users className="w-6 h-6" />} />
        <LoadingSpinner />
      </>
    );
  }

  return (
    <>
      <AppHeader title="参加者一覧" icon={<Users className="w-6 h-6" />} />
      <div className="max-w-md mx-auto p-4">
        <ParticipantsList participants={participants} onParticipantClick={handleParticipantClick} />
      </div>
      <ParticipantDetail participant={selectedParticipant} isOpen={isDetailOpen} onClose={handleCloseDetail} />
    </>
  );
}


