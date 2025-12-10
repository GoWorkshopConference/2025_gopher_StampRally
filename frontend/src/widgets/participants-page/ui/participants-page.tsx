"use client";

import Link from "next/link";
import { AppHeader } from "@/widgets/app-header/ui/app-header";
import { ParticipantsList } from "@/widgets/participants-list/ui/participants-list";
import { ParticipantDetail } from "@/widgets/participant-detail/ui/participant-detail";
import { Users, Clock } from "lucide-react";
import { LoadingSpinner } from "@/shared/ui/loading-spinner";
import { useParticipants } from "@/shared/hooks/use-participants";

export function ParticipantsPage() {
  const { participants, isLoading, selectedParticipant, isDetailOpen, handleParticipantClick, handleCloseDetail } = useParticipants();

  if (isLoading) {
    return (
      <>
        <AppHeader
          title="参加者一覧"
          icon={<Users className="w-6 h-6" />}
          action={
            <Link
              href="https://gwc.gocon.jp/2025/timetable/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-white/40 bg-white/15 p-1.5 text-white shadow-sm transition hover:bg-white/25"
              aria-label="タイムテーブルを表示"
            >
              <Clock className="h-5 w-5" />
            </Link>
          }
        />
        <LoadingSpinner />
      </>
    );
  }

  return (
    <>
      <AppHeader
        title="参加者一覧"
        icon={<Users className="w-6 h-6" />}
        action={
          <Link
            href="https://gwc.gocon.jp/2025/timetable/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/15 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-white/25"
          >
            <Clock className="h-5 w-5" />
          </Link>
        }
      />
      <div className="max-w-md mx-auto p-4">
        <ParticipantsList participants={participants} onParticipantClick={handleParticipantClick} />
      </div>
      <ParticipantDetail participant={selectedParticipant} isOpen={isDetailOpen} onClose={handleCloseDetail} />
    </>
  );
}


