"use client";

import {useCallback, useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {useAtom, useAtomValue, useSetAtom} from "jotai";
import {AppLayout} from "@/widgets/app-layout/ui/app-layout";
import {AppHeader} from "@/widgets/app-header/ui/app-header";
import {ParticipantsList} from "@/widgets/participants-list/ui/participants-list";
import {ParticipantDetail} from "@/widgets/participant-detail/ui/participant-detail";
import {Users} from "lucide-react";
import {
    apiStampsAtom,
    apiUsersAtom,
    isDetailOpenAtom,
    type ParticipantDetailData,
    participantsAtom,
    selectedParticipantAtom,
    type Stamp,
    userProfileAtom,
} from "@/shared/store/atoms";
import {useAuthRedirect} from "@/shared/hooks/use-auth-redirect";
import {MY_PROFILE_ID} from "@/shared/constants";
import {userAPI, userStampAPI} from "@/shared/api/client";

export default function ParticipantsPage() {
    useAuthRedirect();
    const router = useRouter();
    const participants = useAtomValue(participantsAtom);
    const userProfile = useAtomValue(userProfileAtom);
    const [selectedParticipant, setSelectedParticipant] = useAtom(selectedParticipantAtom);
    const [isDetailOpen, setIsDetailOpen] = useAtom(isDetailOpenAtom);
    const setApiUsers = useSetAtom(apiUsersAtom);
    const apiStamps = useAtomValue(apiStampsAtom);
    const [isLoading, setIsLoading] = useState(true);

    // ユーザー一覧を取得
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const users = await userAPI.list();
                setApiUsers(users);
            } catch (error) {
                console.error('Failed to fetch users:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, [setApiUsers]);

    const handleParticipantClick = useCallback(
        async (participantId: number) => {
            // 自分の情報をクリックした場合はプロフィールページに遷移
            if (participantId === MY_PROFILE_ID && userProfile) {
                router.push("/profile");
                return;
            }

            try {
                // ユーザー詳細を取得
                const userDetail = await userAPI.get(participantId);

                let acquiredStampIds: Set<number>;

                // 自分のスタンプ情報はLocalStorageから取得、他のユーザーはAPIから取得
                const isMyself = userProfile && participantId === Number(userProfile.id);

                if (isMyself) {
                    // 自分の場合: LocalStorageから取得
                    const userStampsStorage = localStorage.getItem('gopher_stamp_rally_user_stamps');
                    if (userStampsStorage) {
                        const userStampsMap = JSON.parse(userStampsStorage);
                        const myStamps = userStampsMap[userProfile.id] || [];
                        acquiredStampIds = new Set(myStamps);
                    } else {
                        acquiredStampIds = new Set();
                    }
                } else {
                    // 他のユーザーの場合: APIから取得
                    const userStampsResponse = await userStampAPI.list(participantId);
                    acquiredStampIds = new Set(userStampsResponse.stamps.map(s => s.stamp_id));
                }

                // スタンプ情報を結合
                const stamps: Stamp[] = apiStamps.map(stamp => ({
                    id: stamp.id,
                    name: stamp.name,
                    image: stamp.image,
                    isCollected: acquiredStampIds.has(stamp.id),
                }));

                const participantDetail: ParticipantDetailData = {
                    id: userDetail.id,
                    name: userDetail.name,
                    affiliation: userDetail.favorite_go_feature || '未設定',
                    interests: userDetail.favorite_go_feature || '未設定',
                    twitterId: userDetail.twitter_id || '未設定',
                    stamps,
                };

                setSelectedParticipant(participantDetail);
                setIsDetailOpen(true);
            } catch (error) {
                console.error('Failed to fetch user detail:', error);
            }
        },
        [userProfile, router, setSelectedParticipant, setIsDetailOpen, apiStamps]
    );

    const handleCloseDetail = useCallback(() => {
        setIsDetailOpen(false);
    }, [setIsDetailOpen]);

    if (isLoading) {
        return (
            <AppLayout>
                <AppHeader title="参加者一覧" icon={<Users className="w-6 h-6"/>}/>
                <div className="max-w-md mx-auto p-4 text-center">
                    <p>読み込み中...</p>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <AppHeader title="参加者一覧" icon={<Users className="w-6 h-6"/>}/>
            <div className="max-w-md mx-auto p-4">
                <ParticipantsList participants={participants} onParticipantClick={handleParticipantClick}/>
            </div>
            <ParticipantDetail
                participant={selectedParticipant}
                isOpen={isDetailOpen}
                onClose={handleCloseDetail}
            />
        </AppLayout>
    );
}

