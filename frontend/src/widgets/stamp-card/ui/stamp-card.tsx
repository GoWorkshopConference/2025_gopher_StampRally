import { Card } from "@/shared/ui/card";

interface StampCardProps {
  id: number;
  name: string;
  time: string;
  isCollected: boolean;
  onCollect: (id: number) => void;
}

export function StampCard({ id, name, time, isCollected, onCollect }: StampCardProps) {
  return (
    <Card
      className={`overflow-hidden transition-all duration-300 cursor-pointer ${
        isCollected
          ? "bg-white border-cyan-300 shadow-lg"
          : "bg-white/80 border-cyan-200 hover:border-cyan-300 hover:shadow-md"
      }`}
      onClick={() => !isCollected && onCollect(id)}
    >
      <div className="px-4 py-4">
        <div className="bg-white rounded-lg border border-cyan-200 px-5 py-6 text-center flex flex-col items-center gap-4">
          <div className="flex flex-col items-center gap-3">
          {isCollected ? (
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center justify-center w-24 h-24 rounded-full bg-red-500/90 shadow-xl border-[6px] border-red-600">
                <div className="text-center text-white">
                  <div className="text-xs">参加済</div>
                  <div className="text-2xl tracking-widest">済</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center w-24 h-24 rounded-full border-[6px] border-dashed border-cyan-300/80">
              <span className="text-sm font-semibold text-cyan-500">未参加</span>
            </div>
          )}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-cyan-500">{time}</span>
              <h3 className="text-base font-semibold text-gray-800 leading-tight">{name}</h3>
            </div>
          </div>

          {!isCollected ? (
            <p className="text-xs font-medium text-cyan-600">タップしてスタンプを押す</p>
          ) : (
            <p className="text-xs font-medium text-red-500">参加済みスタンプです</p>
          )}
        </div>
      </div>
    </Card>
  );
}


