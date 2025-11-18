"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAtom, useAtomValue } from "jotai";
import { AppLayout } from "@/widgets/app-layout/ui/app-layout";
import { AppHeader } from "@/widgets/app-header/ui/app-header";
import { ParticipantsList } from "@/widgets/participants-list/ui/participants-list";
import { ParticipantDetail } from "@/widgets/participant-detail/ui/participant-detail";
import { Users } from "lucide-react";
import {
  participantsAtom,
  selectedParticipantAtom,
  isDetailOpenAtom,
  mockParticipantsDetail,
  userProfileAtom,
} from "@/shared/store/atoms";
import { useAuthRedirect } from "@/shared/hooks/use-auth-redirect";
import { MY_PROFILE_ID } from "@/shared/constants";

export default function ParticipantsPage() {
  useAuthRedirect();
  const router = useRouter();
  const participants = useAtomValue(participantsAtom);
  const userProfile = useAtomValue(userProfileAtom);
  const [selectedParticipant, setSelectedParticipant] = useAtom(selectedParticipantAtom);
  const [isDetailOpen, setIsDetailOpen] = useAtom(isDetailOpenAtom);

  const handleParticipantClick = useCallback(
    (participantId: number) => {
      // 自分の情報をクリックした場合はプロフィールページに遷移
      if (participantId === MY_PROFILE_ID && userProfile) {
        router.push("/profile");
        return;
      }

      const participant = mockParticipantsDetail.find((p) => p.id === participantId);
      if (participant) {
        setSelectedParticipant(participant);
        setIsDetailOpen(true);
      }
    },
    [userProfile, router, setSelectedParticipant, setIsDetailOpen]
  );

  const handleCloseDetail = useCallback(() => {
    setIsDetailOpen(false);
  }, [setIsDetailOpen]);

  return (
    <AppLayout>
      <AppHeader title="参加者一覧" icon={<Users className="w-6 h-6" />} />
      <div className="max-w-md mx-auto p-4">
        <ParticipantsList participants={participants} onParticipantClick={handleParticipantClick} />
      </div>
      <ParticipantDetail
        participant={selectedParticipant}
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
      />
    </AppLayout>
  );
}

