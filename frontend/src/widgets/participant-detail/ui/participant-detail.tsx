import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Badge } from "@/shared/ui/badge";
import { Card } from "@/shared/ui/card";
import { User, Briefcase, MessageCircle, Award } from "lucide-react";

interface Stamp {
  id: number;
  name: string;
  time: string;
  isCollected: boolean;
}

interface ParticipantDetailData {
  id: number;
  name: string;
  affiliation: string;
  interests: string;
  twitterId: string;
  stamps: Stamp[];
}

interface ParticipantDetailProps {
  participant: ParticipantDetailData | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ParticipantDetail({ participant, isOpen, onClose }: ParticipantDetailProps) {
  if (!participant) return null;
  const collectedCount = participant.stamps.filter((s) => s.isCollected).length;
  const totalCount = participant.stamps.length;
  const isComplete = collectedCount === totalCount;
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gradient-to-br from-cyan-50 to-blue-50 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-cyan-900">
            <User className="w-5 h-5" />
            参加者詳細
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-cyan-900">{participant.name}</h2>
            {isComplete && (
              <Badge className="bg-yellow-500 text-white">
                <Award className="w-3 h-3 mr-1" />
                完走
              </Badge>
            )}
          </div>
          <Card className="p-3 bg-white/80 border-cyan-200">
            <div className="flex items-start gap-2">
              <Briefcase className="w-4 h-4 text-cyan-600 mt-0.5" />
              <div>
                <div className="text-xs text-cyan-600 mb-1">所属</div>
                <p className="text-sm text-gray-700">{participant.affiliation}</p>
              </div>
            </div>
          </Card>
          <Card className="p-3 bg-white/80 border-cyan-200">
            <div className="flex items-start gap-2">
              <MessageCircle className="w-4 h-4 text-cyan-600 mt-0.5" />
              <div>
                <div className="text-xs text-cyan-600 mb-1">気になっていること</div>
                <p className="text-sm text-gray-700">{participant.interests}</p>
              </div>
            </div>
          </Card>
          <Card className="p-3 bg-white/80 border-cyan-200">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-cyan-600 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <div>
                <div className="text-xs text-cyan-600 mb-1">X (Twitter)</div>
                <a
                  href={`https://twitter.com/${participant.twitterId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  @{participant.twitterId}
                </a>
              </div>
            </div>
          </Card>
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-cyan-900">スタンプの状態</h3>
              <Badge variant="secondary" className="bg-cyan-100 text-cyan-700">
                {collectedCount} / {totalCount}
              </Badge>
            </div>
            <div className="space-y-2">
              {participant.stamps.map((stamp) => (
                <Card
                  key={stamp.id}
                  className={`p-3 transition-all ${
                    stamp.isCollected ? "bg-cyan-100/50 border-cyan-300" : "bg-white/50 border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className={`text-sm ${stamp.isCollected ? "text-cyan-900" : "text-gray-500"}`}>{stamp.name}</p>
                      <p className="text-xs text-cyan-600 mt-0.5">{stamp.time}</p>
                    </div>
                    {stamp.isCollected ? (
                      <Badge className="bg-red-500 text-white text-xs">参加済</Badge>
                    ) : (
                      <Badge variant="outline" className="border-gray-300 text-gray-400 text-xs">
                        未参加
                      </Badge>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}













