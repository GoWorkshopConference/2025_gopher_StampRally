"use client";

import {useEffect, useMemo, useState} from "react";
import {useAtom, useAtomValue, useSetAtom} from "jotai";
import {AppLayout} from "@/widgets/app-layout/ui/app-layout";
import {AppHeader} from "@/widgets/app-header/ui/app-header";
import {StampCard} from "@/widgets/stamp-card/ui/stamp-card";
import {Progress} from "@/shared/ui/progress";
import {Star, Trophy} from "lucide-react";
import {acquiredStampIdsAtom, apiStampsAtom, stampsAtom, userProfileAtom} from "@/shared/store/atoms";
import {useAuthRedirect} from "@/shared/hooks/use-auth-redirect";
import {fetchStampList, fetchStampDetail} from "@/shared/api/stamp-api";

export default function StampsPage() {
    useAuthRedirect();
    const stamps = useAtomValue(stampsAtom);
    const setApiStamps = useSetAtom(apiStampsAtom);
    const acquiredStampIds = useAtomValue(acquiredStampIdsAtom);
    const [userProfile, setUserProfile] = useAtom(userProfileAtom);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedStamp, setSelectedStamp] = useState<{ id: number; name: string; image: string } | null>(null);

    // スタンプ一覧を取得
    useEffect(() => {
        const fetchStamps = async () => {
            try {
                const response = await fetchStampList(100, 0);
                setApiStamps(response.stamps);

                // userProfileのtotalCountを更新
                if (userProfile && userProfile.totalCount !== response.stamps.length) {
                    setUserProfile({
                        ...userProfile,
                        totalCount: response.stamps.length,
                    });
                }

                // 自分の取得済みスタンプはLocalStorageから自動的に読み込まれる
                // acquiredStampIdsAtomがuserProfile.idに基づいてLocalStorageから取得
                if (userProfile?.id) {
                    const userId = Number(userProfile.id);
                    if (!isNaN(userId)) {
                        // LocalStorageから読み込まれたスタンプ数でcompletedCountを更新
                        if (userProfile.completedCount !== acquiredStampIds.size) {
                            setUserProfile({
                                ...userProfile,
                                completedCount: acquiredStampIds.size,
                                totalCount: response.stamps.length,
                            });
                        }
                        console.log(`Loaded ${acquiredStampIds.size} stamps from LocalStorage for user ${userId}`);
                    } else {
                        console.warn('Invalid user ID, cannot load stamps');
                    }
                } else {
                    console.log('No user profile, stamps will be empty');
                }
            } catch (error) {
                console.error('Failed to fetch stamps:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStamps();
    }, [setApiStamps, setUserProfile, userProfile?.id]);

    const handleCollect = async (id: number) => {
        if (!userProfile?.id) {
            console.warn('No user profile found');
            return;
        }

        try {
            // スタンプ詳細を取得して表示（取得APIは呼ばない）
            console.log(`Showing stamp detail for id ${id}`);
            const stampDetail = await fetchStampDetail(id);
            console.log('Stamp detail:', stampDetail);
            setSelectedStamp(stampDetail);
        } catch (error) {
            console.error('Failed to show stamp detail:', error);
            alert(`スタンプの詳細表示に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const {collectedCount, totalCount, progressPercentage, isComplete} = useMemo(() => {
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
            <AppLayout>
                <AppHeader
                    title="Gophers Stamp Rally"
                    icon={<Star className="w-6 h-6" fill="currentColor"/>}
                />
                <div className="max-w-md mx-auto p-4 text-center">
                    <p>読み込み中...</p>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <AppHeader
                title="Gophers Stamp Rally"
                icon={<Star className="w-6 h-6" fill="currentColor"/>}
                badge={`${collectedCount} / ${totalCount}`}
            >
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>進捗状況</span>
                        <span>{Math.round(progressPercentage)}%</span>
                    </div>
                    <Progress value={progressPercentage} className="h-3 bg-white/20"/>
                </div>
            </AppHeader>

            {isComplete && (
                <div className="max-w-md mx-auto mt-6 px-4">
                    <div
                        className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white p-6 rounded-2xl shadow-2xl text-center animate-pulse">
                        <Trophy className="w-16 h-16 mx-auto mb-3" fill="currentColor"/>
                        <h2 className="mb-2">🎉 コンプリート！ 🎉</h2>
                        <p className="text-sm">全てのスタンプを集めました！</p>
                    </div>
                </div>
            )}

            <div className="max-w-md mx-auto p-4">
                <div className="grid grid-cols-2 gap-3">
                    {stamps.map((stamp) => (
                        <StampCard key={stamp.id} {...stamp} onCollect={handleCollect}/>
                    ))}
                </div>
            </div>

            {/* スタンプ詳細ダイアログ */}
            {selectedStamp && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedStamp(null)}
                >
                    <div
                        className="bg-white rounded-lg p-6 max-w-md w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-xl font-bold mb-4">{selectedStamp.name}</h2>
                        <div className="mb-4">
                            <img
                                src={selectedStamp.image}
                                alt={selectedStamp.name}
                                className="w-full h-48 object-cover rounded"
                                onError={(e) => {
                                    e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Stamp';
                                }}
                            />
                        </div>

                        {acquiredStampIds.has(selectedStamp.id) && (
                            <p className="text-green-600 font-semibold mb-4">✅ 取得済みのスタンプです</p>
                        )}

                        <button
                            onClick={() => setSelectedStamp(null)}
                            className="w-full bg-cyan-500 text-white py-2 rounded hover:bg-cyan-600"
                        >
                            閉じる
                        </button>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}

