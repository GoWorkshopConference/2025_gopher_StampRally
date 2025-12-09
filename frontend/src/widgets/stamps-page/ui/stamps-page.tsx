"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AppHeader } from "@/widgets/app-header/ui/app-header";
import { Progress } from "@/shared/ui/progress";
import { CompletionBanner } from "@/shared/ui/completion-banner";
import { StampGrid } from "@/widgets/stamp-grid/ui/stamp-grid";
import { StampDetailDialog } from "@/widgets/stamp-detail-dialog/ui/stamp-detail-dialog";
import { LoadingSpinner } from "@/shared/ui/loading-spinner";
import { useStamps } from "@/shared/hooks/use-stamps";

export function StampsPage() {
  const { stamps, isLoading, selectedStamp, setSelectedStamp, handleStampClick, acquiredStampIds } = useStamps();

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

  if (isLoading) {
    return (
      <>
        <AppHeader title="Gophers Stamp Rally" icon={<img src="/gwc-title.png" alt="Gophers Stamp Rally" className="w-6 h-6 object-contain" />} />
        <LoadingSpinner />
      </>
    );
  }

  return (
    <>
      <AppHeader
        title="Gophers Stamp Rally"
        icon={<img src="/gwc-title.png" alt="Gophers Stamp Rally" className="w-6 h-6 object-contain" />}
        badge={`${collectedCount} / ${totalCount}`}
        action={
          <Link
            href="https://gwc.gocon.jp/2025/timetable/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/15 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-white/25"
          >
            タイムテーブル
          </Link>
        }
      >
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-semibold">{collectedCount} / {totalCount}</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-3 bg-white/20" />
        </div>
      </AppHeader>

      {isComplete && (
        <div className="max-w-md mx-auto mt-6 px-4">
          <CompletionBanner />
        </div>
      )}

      <StampGrid stamps={stamps} onStampClick={handleStampClick} />

      <StampDetailDialog
        stamp={selectedStamp}
        isAcquired={selectedStamp ? acquiredStampIds.has(selectedStamp.id) : false}
        open={selectedStamp !== null}
        onClose={() => setSelectedStamp(null)}
      />
    </>
  );
}


