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

export function StampDetailDialog({
  stamp,
  isAcquired,
  open,
  onClose,
}: StampDetailDialogProps) {
  if (!stamp) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>{stamp.name}</DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          <StampImageDetail stampName={stamp.name} isAcquired={isAcquired} />
        </div>
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

