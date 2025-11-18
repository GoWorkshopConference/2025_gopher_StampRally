"use client";

import { useMemo } from "react";
import { useAtom } from "jotai";
import { AppLayout } from "@/widgets/app-layout/ui/app-layout";
import { AppHeader } from "@/widgets/app-header/ui/app-header";
import { StampCard } from "@/widgets/stamp-card/ui/stamp-card";
import { Progress } from "@/shared/ui/progress";
import { Star, Trophy } from "lucide-react";
import { stampsAtom } from "@/shared/store/atoms";
import { useAuthRedirect } from "@/shared/hooks/use-auth-redirect";

export default function StampsPage() {
  useAuthRedirect();
  const [stamps, setStamps] = useAtom(stampsAtom);

  const handleCollect = (id: number) => {
    const updatedStamps = stamps.map((stamp) =>
      stamp.id === id ? { ...stamp, isCollected: true } : stamp
    );
    setStamps(updatedStamps);
  };

  const { collectedCount, totalCount, progressPercentage, isComplete } = useMemo(() => {
    const collected = stamps.filter((s) => s.isCollected).length;
    const total = stamps.length;
    const progress = total > 0 ? (collected / total) * 100 : 0;
    const complete = collected === total && total > 0;
    return {
      collectedCount: collected,
      totalCount: total,
      progressPercentage: progress,
      isComplete: complete,
    };
  }, [stamps]);

  return (
    <AppLayout>
      <AppHeader
        title="Gopher Stamp Rally"
        icon={<Star className="w-6 h-6" fill="currentColor" />}
        badge={`${collectedCount} / ${totalCount}`}
      >
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>進捗状況</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-3 bg-white/20" />
        </div>
      </AppHeader>

      {isComplete && (
        <div className="max-w-md mx-auto mt-6 px-4">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white p-6 rounded-2xl shadow-2xl text-center animate-pulse">
            <Trophy className="w-16 h-16 mx-auto mb-3" fill="currentColor" />
            <h2 className="mb-2">🎉 コンプリート！ 🎉</h2>
            <p className="text-sm">全てのスタンプを集めました！</p>
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto p-4">
        <div className="grid grid-cols-2 gap-3">
          {stamps.map((stamp) => (
            <StampCard key={stamp.id} {...stamp} onCollect={handleCollect} />
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

