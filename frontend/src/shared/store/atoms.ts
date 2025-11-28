import {atom} from "jotai";
import {atomWithStorage} from "jotai/utils";
import {UserProfile} from "../types/user";
import {MY_PROFILE_ID} from "../constants";
import type {Stamp as APIStamp, User} from "../api/generated/api.schemas";

// UI用のStamp型（API型を拡張）
export interface Stamp extends Omit<APIStamp, 'created_at' | 'updated_at'> {
    isCollected: boolean;
}

// UI用のParticipant型
export interface Participant {
    id: number;
    name: string;
    completedCount: number;
    totalCount: number;
    profileImageUrl?: string;
    isMine?: boolean;
    twitter_id?: string;
}

// UI用のParticipantDetailData型
export interface ParticipantDetailData {
    id: number;
    name: string;
    affiliation: string;
    interests: string;
    twitterId: string;
    stamps: Stamp[];
}


// localStorageと同期するユーザープロフィールatom
export const userProfileAtom = atomWithStorage<UserProfile | null>(
    "gopher_stamp_rally_user_profile",
    null
);

// APIから取得したスタンプ一覧のatom
export const apiStampsAtom = atom<APIStamp[]>([]);

// ユーザーIDごとの取得済みスタンプIDを保存する型
type UserStampsMap = Record<string, number[]>;

// LocalStorageと同期する取得済みスタンプIDのマップ（ユーザーIDごと）
const userStampsStorageAtom = atomWithStorage<UserStampsMap>(
    "gopher_stamp_rally_user_stamps",
    {}
);

// 現在のユーザーの取得済みスタンプIDのセット（derived atom）
export const acquiredStampIdsAtom = atom<Set<number>>((get) => {
    const userProfile = get(userProfileAtom);
    const userStampsMap = get(userStampsStorageAtom);

    if (!userProfile?.id) {
        return new Set<number>();
    }

    const userStamps = userStampsMap[userProfile.id] || [];
    return new Set<number>(userStamps);
});

// スタンプのatom（APIデータとユーザーの取得状態を結合）
export const stampsAtom = atom<Stamp[]>((get) => {
    const apiStamps = get(apiStampsAtom);
    const acquiredIds = get(acquiredStampIdsAtom);

    return apiStamps.map(stamp => ({
        id: stamp.id,
        name: stamp.name,
        image: stamp.image,
        isCollected: acquiredIds.has(stamp.id),
    }));
});

// APIから取得したユーザー一覧のatom
export const apiUsersAtom = atom<User[]>([]);

// 各ユーザーの取得済みスタンプ数を記録
export const userStampCountsAtom = atom<Record<number, number>>({});

// 参加者リストのatom（APIデータから派生）
export const participantsAtom = atom<Participant[]>((get) => {
    const profile = get(userProfileAtom);
    const apiUsers = get(apiUsersAtom);
    const stampCounts = get(userStampCountsAtom);
    const totalStamps = get(apiStampsAtom).length;
    const acquiredIds = get(acquiredStampIdsAtom);

    const participantsFromApi: Participant[] = apiUsers.map(user => ({
        id: user.id,
        name: user.name,
        completedCount: stampCounts[user.id] ?? 0,
        totalCount: totalStamps,
        profileImageUrl: user.icon,
        isMine: false,
        twitter_id: user.twitter_id,
    }));

    if (profile) {
        const myParticipant: Participant = {
            id: MY_PROFILE_ID,
            name: profile.nickname,
            completedCount: acquiredIds.size,
            totalCount: totalStamps,
            profileImageUrl: profile.profileImageUrl,
            isMine: true,
        };
        return [myParticipant, ...participantsFromApi];
    }

    return participantsFromApi;
});

// UI状態のatoms
export const selectedParticipantAtom = atom<ParticipantDetailData | null>(null);
export const isDetailOpenAtom = atom(false);
export const showRegistrationDialogAtom = atom(false);

// ユーザープロフィールが存在するかどうかを確認するatom
export const hasUserProfileAtom = atom<boolean>((get) => {
    return get(userProfileAtom) !== null;
});

// スタンプ追加アクション（書き込み専用atom）
export const addStampAtom = atom(
    null,
    (get, set, stampId: number) => {
        const userProfile = get(userProfileAtom);
        const userStampsMap = get(userStampsStorageAtom);

        if (!userProfile?.id) {
            console.warn('No user profile found, cannot add stamp');
            return false;
        }

        const userId = String(userProfile.id);
        const currentStamps = userStampsMap[userId] || [];

        // 既に取得済みかチェック
        if (currentStamps.includes(stampId)) {
            console.log(`Stamp ${stampId} already acquired`);
            return false;
        }

        // スタンプを追加
        const updatedStamps = [...currentStamps, stampId];
        set(userStampsStorageAtom, {
            ...userStampsMap,
            [userId]: updatedStamps,
        });

        // userProfileのcompletedCountも更新
        set(userProfileAtom, {
            ...userProfile,
            completedCount: updatedStamps.length,
        });

        console.log(`Added stamp ${stampId} for user ${userId}. Total: ${updatedStamps.length}`);
        return true;
    }
);

// スタンプが既に取得済みかチェックする関数
export const isStampAcquiredAtom = atom((get) => (stampId: number): boolean => {
    const acquiredIds = get(acquiredStampIdsAtom);
    return acquiredIds.has(stampId);
});

