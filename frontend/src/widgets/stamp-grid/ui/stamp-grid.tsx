import { StampCard } from "@/widgets/stamp-card/ui/stamp-card";

interface Stamp {
  id: number;
  name: string;
  isCollected: boolean;
}

interface StampGridProps {
  stamps: Stamp[];
  onStampClick: (id: number) => void;
  className?: string;
}

export function StampGrid({ stamps, onStampClick, className = "" }: StampGridProps) {
  return (
    <div className={`max-w-md mx-auto p-4 ${className}`}>
      <div className="grid grid-cols-2 gap-3">
        {stamps.map((stamp) => (
          <StampCard key={stamp.id} {...stamp} onCollect={onStampClick} />
        ))}
      </div>
    </div>
  );
}








