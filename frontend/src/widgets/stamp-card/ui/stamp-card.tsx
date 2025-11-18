import {Card} from "@/shared/ui/card";

interface StampCardProps {
    id: number;
    name: string;
    image: string;
    isCollected: boolean;
    onCollect: (id: number) => void;
}

export function StampCard({id, name, image, isCollected, onCollect}: StampCardProps) {
    return (
        <Card
            className={`overflow-hidden transition-all duration-300 cursor-pointer ${
                isCollected
                    ? "bg-white border-cyan-300 shadow-lg"
                    : "bg-white/80 border-cyan-200 hover:border-cyan-300 hover:shadow-md"
            }`}
            onClick={() => onCollect(id)}
        >
            <div className="px-4 py-4">
                <div
                    className="bg-white rounded-lg border border-cyan-200 px-5 py-6 text-center flex flex-col items-center gap-4">
                    <div className="flex flex-col items-center gap-3">
                        <div className="relative w-24 h-24">
                            <img
                                src={image}
                                alt={name}
                                className="w-full h-full object-cover rounded-full"
                                onError={(e) => {
                                    e.currentTarget.src = 'https://via.placeholder.com/96?text=Stamp';
                                }}
                            />
                            {isCollected && (
                                <div
                                    className="absolute inset-0 flex items-center justify-center bg-red-500/90 rounded-full border-[6px] border-red-600">
                                    <div className="text-center text-white">
                                        <div className="text-xs">取得済</div>
                                        <div className="text-2xl tracking-widest">済</div>
                                    </div>
                                </div>
                            )}
                            {!isCollected && (
                                <div
                                    className="absolute inset-0 flex items-center justify-center rounded-full border-[6px] border-dashed border-cyan-300/80 bg-white/80">
                                    <span className="text-sm font-semibold text-cyan-500">未取得</span>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col gap-1">
                            <h3 className="text-base font-semibold text-gray-800 leading-tight">{name}</h3>
                        </div>
                    </div>

                    {!isCollected ? (
                        <p className="text-xs font-medium text-cyan-600">タップで詳細表示</p>
                    ) : (
                        <p className="text-xs font-medium text-red-500">タップで詳細表示</p>
                    )}
                </div>
            </div>
        </Card>
    );
}


