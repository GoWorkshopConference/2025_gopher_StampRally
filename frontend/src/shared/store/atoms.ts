import {atom} from "jotai";
import {atomWithStorage} from "jotai/utils";
import {UserProfile} from "../types/user";
import {MY_PROFILE_ID} from "../constants";
import type {Stamp as APIStamp, User} from "../api/types";

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
export const acquiredStampIdsAtom = atom<Set<number>>(
    (get) => {
        const userProfile = get(userProfileAtom);
        const userStampsMap = get(userStampsStorageAtom);

        if (!userProfile?.id) {
            return new Set<number>();
        }

        const userStamps = userStampsMap[userProfile.id] || [];
        return new Set<number>(userStamps);
    },
    (get, set, newStampIds: Set<number>) => {
        const userProfile = get(userProfileAtom);

        if (!userProfile?.id) {
            return;
        }

        const userStampsMap = get(userStampsStorageAtom);
        const updatedMap = {
            ...userStampsMap,
            [userProfile.id]: Array.from(newStampIds),
        };

        set(userStampsStorageAtom, updatedMap);
    }
);

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

// 参加者リストのatom（APIデータから派生）
export const participantsAtom = atom<Participant[]>((get) => {
    const profile = get(userProfileAtom);
    const apiUsers = get(apiUsersAtom);

    const participants: Participant[] = apiUsers.map(user => ({
        id: user.id,
        name: user.name,
        completedCount: 0, // UserDetailから取得する必要がある
        totalCount: 0,
        profileImageUrl: user.icon,
        isMine: false,
        twitter_id: user.twitter_id,
    }));

    if (profile) {
        const myParticipant: Participant = {
            id: MY_PROFILE_ID,
            name: profile.nickname,
            completedCount: profile.completedCount,
            totalCount: profile.totalCount,
            profileImageUrl: profile.profileImageUrl,
            isMine: true,
        };
        return [myParticipant, ...participants];
    }

    return participants;
});

// UI状態のatoms
export const selectedParticipantAtom = atom<ParticipantDetailData | null>(null);
export const isDetailOpenAtom = atom(false);
export const showRegistrationDialogAtom = atom(false);

// ユーザープロフィールが存在するかどうかを確認するatom
export const hasUserProfileAtom = atom<boolean>((get) => {
    return get(userProfileAtom) !== null;
});

