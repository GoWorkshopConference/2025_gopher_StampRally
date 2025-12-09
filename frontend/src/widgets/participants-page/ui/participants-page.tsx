"use client";

import { AppHeader } from "@/widgets/app-header/ui/app-header";
import { ParticipantsList } from "@/widgets/participants-list/ui/participants-list";
import { ParticipantDetail } from "@/widgets/participant-detail/ui/participant-detail";
import { Users, Filter } from "lucide-react";
import { LoadingSpinner } from "@/shared/ui/loading-spinner";
import { useParticipants } from "@/shared/hooks/use-participants";
import { useState } from "react";
import { useAtomValue } from "jotai";
import { apiStampsAtom, userAcquiredStampsMapAtom } from "@/shared/store/atoms";
import { Input } from "@/shared/ui/input";

export function ParticipantsPage() {
  const { participants, isLoading, selectedParticipant, isDetailOpen, handleParticipantClick, handleCloseDetail } = useParticipants();
  const apiStamps = useAtomValue(apiStampsAtom);
  const userAcquiredStampsMap = useAtomValue(userAcquiredStampsMapAtom);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStampId, setSelectedStampId] = useState<string>("all");

  // Filtering logic
  const filteredParticipants = participants.filter((participant) => {
    // 1. Text Search (Name or Twitter ID)
    const normalizedQuery = searchQuery.toLowerCase();
    const nameMatch = participant.name.toLowerCase().includes(normalizedQuery);
    const twitterMatch = participant.twitter_id?.toLowerCase().includes(normalizedQuery);
    const isTextMatch = !searchQuery || nameMatch || twitterMatch;

    // 2. Stamp Filter
    let isStampMatch = true;
    if (selectedStampId !== "all") {
      const stampIdNum = Number(selectedStampId);
      const userStamps = userAcquiredStampsMap[participant.id] || [];
      
      // Check if user has the selected stamp
      // Note: "My" stamps logic might need to be unified if my ID is special,
      // but participantsAtom unifies the list structure, so ID should key into map correctly.
      isStampMatch = userStamps.includes(stampIdNum);
    }

    return isTextMatch && isStampMatch;
  });

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
      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Filter Controls */}
        <div className="space-y-3 bg-white/50 p-3 rounded-lg border border-cyan-100">
          <Input
            placeholder="名前やTwitter IDで検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white"
          />
          
          <div className="relative">
            <select
              className="w-full h-10 px-3 py-2 rounded-md border border-input bg-white text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={selectedStampId}
              onChange={(e) => setSelectedStampId(e.target.value)}
            >
              <option value="all">すべて</option>
              {apiStamps.map((stamp) => (
                <option key={stamp.id} value={stamp.id}>
                  {stamp.name}
                </option>
              ))}
            </select>
            <Filter className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-500 text-right">
          {filteredParticipants.length} 件のユーザー
        </div>

        <ParticipantsList participants={filteredParticipants} onParticipantClick={handleParticipantClick} />
      </div>
      <ParticipantDetail participant={selectedParticipant} isOpen={isDetailOpen} onClose={handleCloseDetail} />
    </>
  );
}


