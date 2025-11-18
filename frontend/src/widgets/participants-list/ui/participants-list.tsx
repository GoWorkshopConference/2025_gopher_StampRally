import { Card } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { User, Award } from "lucide-react";
import { ImageWithFallback } from "@/shared/lib/ImageWithFallback";
import { MY_PROFILE_ID } from "@/shared/constants";

interface Participant {
  id: number;
  name: string;
  completedCount: number;
  totalCount: number;
  profileImageUrl?: string;
  isMine?: boolean;
}

interface ParticipantsListProps {
  participants: Participant[];
  onParticipantClick?: (id: number) => void;
}

export function ParticipantsList({ participants, onParticipantClick }: ParticipantsListProps) {
  return (
    <div className="space-y-3">
      {participants.map((participant) => {
        const isComplete = participant.completedCount === participant.totalCount;
        const progressPercentage =
          participant.totalCount > 0
            ? (participant.completedCount / participant.totalCount) * 100
            : 0;
        const isMine = participant.id === MY_PROFILE_ID || participant.isMine;
        return (
          <Card
            key={participant.id}
            className={`p-4 bg-white/80 border-cyan-200 hover:border-cyan-300 transition-all cursor-pointer hover:shadow-md ${
              isMine ? "border-2 border-cyan-500 bg-cyan-50/50" : ""
            }`}
            onClick={() => onParticipantClick?.(participant.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                {participant.profileImageUrl ? (
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-cyan-300 flex-shrink-0 relative">
                    <ImageWithFallback
                      src={participant.profileImageUrl}
                      alt={participant.name}
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-white" />
                </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-gray-800">{participant.name}</h3>
                    {isMine && (
                      <Badge variant="secondary" className="bg-cyan-100 text-cyan-700 text-xs">
                        あなた
                      </Badge>
                    )}
                    {isComplete && <Award className="w-5 h-5 text-yellow-500 fill-yellow-500" />}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-2 bg-cyan-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-cyan-600 min-w-[3rem] text-right">
                      {participant.completedCount}/{participant.totalCount}
                    </span>
                  </div>
                </div>
              </div>
              {isComplete && <Badge className="bg-yellow-500 text-white ml-2">完走</Badge>}
            </div>
          </Card>
        );
      })}
    </div>
  );
}






