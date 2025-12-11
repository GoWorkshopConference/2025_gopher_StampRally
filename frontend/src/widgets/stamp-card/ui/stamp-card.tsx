import {Card} from "@/shared/ui/card";
import {StampImage} from "@/shared/ui/stamp-image";

interface StampCardProps {
    id: number;
    name: string;
    isCollected: boolean;
    onCollect: (id: number) => void;
}

export function StampCard({id, name, isCollected, onCollect}: StampCardProps) {
    return (
        <Card
            className={`overflow-hidden transition-all duration-300 cursor-pointer ${
                isCollected
                    ? "bg-white border-cyan-300 shadow-lg"
                    : "bg-white border-cyan-200 hover:border-cyan-300 hover:shadow-md"
            }`}
            onClick={() => onCollect(id)}
        >
            <div className="px-5 py-6 text-center flex flex-col items-center gap-4">
                <div className="flex flex-col items-center gap-3">
                    <div className="relative w-24 h-24">
                        <StampImage
                            stampName={name}
                            isAcquired={isCollected}
                            size="medium"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <h3 className="text-base font-semibold text-gray-800 leading-tight">{name}</h3>
                    </div>
                </div>
                <p className="text-xs font-medium text-cyan-600">タップで詳細表示</p>
            </div>
        </Card>
    );
}
