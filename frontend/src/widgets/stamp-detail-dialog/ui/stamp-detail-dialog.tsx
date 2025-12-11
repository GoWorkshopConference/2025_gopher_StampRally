"use client";

import { StampImageDetail } from "@/shared/ui/stamp-image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";

interface StampDetailDialogProps {
  stamp: {
    id: number;
    name: string;
  } | null;
  isAcquired: boolean;
  open: boolean;
  onClose: () => void;
}

function getStampDescription(stampName: string): string | null {
  // スタンプ名の前後の空白を除去して比較
  const trimmedName = stampName.trim();

  switch (trimmedName) {
    case "午前ワークショップ":
      return "10:30 ~ 12:30のKIITOホールで行われるワークショップに参加しよう！";
    case "午後ワークショップ":
      return "15:45 ~ 17:45のKIITOホールで行われるワークショップに参加しよう！";
    case "シャッフルランチ":
      return "ギャラリーAのブースAで12:30 - 14:00に開かれるシャッフルランチに参加しよう！";
    case "ジェスチャーゲーム":
      return "ギャラリーAのブースCで開かれるジェスチャーゲームに参加しよう！";
    case "Go製のゲーム展示":
      return "ギャラリーAのブースBで10:30 - 14:00 & 15:30 - 17:45に開かれるGo製のゲーム展示・ゲーム作りブースに参加しよう！";
    case "Gopher Wall1":
      return "ギャラリーAにあるGopher Wall1「Goの開発スタイル」にPost Itを貼ろう！";
    case "Gopher Wall2":
      return "ギャラリーAにあるGopher Wall2「Goのリリースごとでの思い出」にPost Itを貼ろう！";
    case "Gopher Wall3":
      return "ギャラリーAにあるGopher Wall3「Go のここが好き！」にPost Itを貼ろう！";
    default:
      return null;
  }
}

export function StampDetailDialog({
  stamp,
  isAcquired,
  open,
  onClose,
}: StampDetailDialogProps) {
  if (!stamp) return null;

  const description = getStampDescription(stamp.name);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>{stamp.name}</DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          <StampImageDetail stampName={stamp.name} isAcquired={isAcquired} />
        </div>
        {description && (
          <div className="mb-4 rounded-lg bg-cyan-50 p-4">
            <p className="text-sm leading-relaxed text-gray-900">{description}</p>
          </div>
        )}
        <Button
          onClick={onClose}
          className="w-full bg-cyan-500 text-white hover:bg-cyan-600"
        >
          閉じる
        </Button>
      </DialogContent>
    </Dialog>
  );
}

