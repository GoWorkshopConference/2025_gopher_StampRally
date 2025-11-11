import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { UserProfile } from "../types/user";
import { MY_PROFILE_ID } from "../constants";

export interface Stamp {
  id: number;
  name: string;
  time: string;
  isCollected: boolean;
}

export interface Participant {
  id: number;
  name: string;
  completedCount: number;
  totalCount: number;
  profileImageUrl?: string;
  isMine?: boolean;
}

export interface ParticipantDetailData {
  id: number;
  name: string;
  affiliation: string;
  interests: string;
  twitterId: string;
  stamps: Stamp[];
}

export const mockParticipants: Participant[] = [
  { id: 1, name: "田中 太郎", completedCount: 6, totalCount: 6 },
  { id: 2, name: "佐藤 花子", completedCount: 5, totalCount: 6 },
  { id: 3, name: "鈴木 一郎", completedCount: 4, totalCount: 6 },
  { id: 4, name: "高橋 美咲", completedCount: 6, totalCount: 6 },
  { id: 5, name: "伊藤 健太", completedCount: 3, totalCount: 6 },
  { id: 6, name: "渡辺 さくら", completedCount: 5, totalCount: 6 },
  { id: 7, name: "山本 大輔", completedCount: 2, totalCount: 6 },
  { id: 8, name: "中村 あい", completedCount: 6, totalCount: 6 },
];

export const mockParticipantsDetail: ParticipantDetailData[] = [
  {
    id: 1,
    name: "田中 太郎",
    affiliation: "株式会社テックイノベーション",
    interests: "機械学習を使った業務効率化について学びたい",
    twitterId: "tanaka_taro",
    stamps: [
      { id: 1, name: "プログラミング入門ワークショップ", time: "10:00-11:30", isCollected: true },
      { id: 2, name: "デザイン思考体験セミナー", time: "11:45-13:15", isCollected: true },
      { id: 3, name: "Web開発基礎講座", time: "13:30-15:00", isCollected: true },
      { id: 4, name: "UIUXデザイン実践", time: "15:15-16:45", isCollected: true },
      { id: 5, name: "アジャイル開発入門", time: "17:00-18:30", isCollected: true },
      { id: 6, name: "データ分析ハンズオン", time: "10:00-11:30", isCollected: true },
    ],
  },
  {
    id: 2,
    name: "佐藤 花子",
    affiliation: "デザインスタジオ サクラ",
    interests: "ユーザビリティテストの実践方法",
    twitterId: "sato_hanako",
    stamps: [
      { id: 1, name: "プログラミング入門ワークショップ", time: "10:00-11:30", isCollected: true },
      { id: 2, name: "デザイン思考体験セミナー", time: "11:45-13:15", isCollected: true },
      { id: 3, name: "Web開発基礎講座", time: "13:30-15:00", isCollected: false },
      { id: 4, name: "UIUXデザイン実践", time: "15:15-16:45", isCollected: true },
      { id: 5, name: "アジャイル開発入門", time: "17:00-18:30", isCollected: true },
      { id: 6, name: "データ分析ハンズオン", time: "10:00-11:30", isCollected: true },
    ],
  },
  {
    id: 3,
    name: "鈴木 一郎",
    affiliation: "フリーランス エンジニア",
    interests: "最新のフロントエンド技術トレンド",
    twitterId: "suzuki_ichiro",
    stamps: [
      { id: 1, name: "プログラミング入門ワークショップ", time: "10:00-11:30", isCollected: true },
      { id: 2, name: "デザイン思考体験セミナー", time: "11:45-13:15", isCollected: false },
      { id: 3, name: "Web開発基礎講座", time: "13:30-15:00", isCollected: true },
      { id: 4, name: "UIUXデザイン実践", time: "15:15-16:45", isCollected: false },
      { id: 5, name: "アジャイル開発入門", time: "17:00-18:30", isCollected: true },
      { id: 6, name: "データ分析ハンズオン", time: "10:00-11:30", isCollected: true },
    ],
  },
  {
    id: 4,
    name: "高橋 美咲",
    affiliation: "ミライ大学 情報工学部",
    interests: "チーム開発でのコミュニケーション術",
    twitterId: "takahashi_misaki",
    stamps: [
      { id: 1, name: "プログラミング入門ワークショップ", time: "10:00-11:30", isCollected: true },
      { id: 2, name: "デザイン思考体験セミナー", time: "11:45-13:15", isCollected: true },
      { id: 3, name: "Web開発基礎講座", time: "13:30-15:00", isCollected: true },
      { id: 4, name: "UIUXデザイン実践", time: "15:15-16:45", isCollected: true },
      { id: 5, name: "アジャイル開発入門", time: "17:00-18:30", isCollected: true },
      { id: 6, name: "データ分析ハンズオン", time: "10:00-11:30", isCollected: true },
    ],
  },
  {
    id: 5,
    name: "伊藤 健太",
    affiliation: "スタートアップ株式会社",
    interests: "プロダクト開発のスピードアップ",
    twitterId: "ito_kenta",
    stamps: [
      { id: 1, name: "プログラミング入門ワークショップ", time: "10:00-11:30", isCollected: true },
      { id: 2, name: "デザイン思考体験セミナー", time: "11:45-13:15", isCollected: false },
      { id: 3, name: "Web開発基礎講座", time: "13:30-15:00", isCollected: false },
      { id: 4, name: "UIUXデザイン実践", time: "15:15-16:45", isCollected: true },
      { id: 5, name: "アジャイル開発入門", time: "17:00-18:30", isCollected: false },
      { id: 6, name: "データ分析ハンズオン", time: "10:00-11:30", isCollected: true },
    ],
  },
  {
    id: 6,
    name: "渡辺 さくら",
    affiliation: "クリエイティブエージェンシー BLOOM",
    interests: "データドリブンなデザイン手法",
    twitterId: "watanabe_sakura",
    stamps: [
      { id: 1, name: "プログラミング入門ワークショップ", time: "10:00-11:30", isCollected: true },
      { id: 2, name: "デザイン思考体験セミナー", time: "11:45-13:15", isCollected: true },
      { id: 3, name: "Web開発基礎講座", time: "13:30-15:00", isCollected: true },
      { id: 4, name: "UIUXデザイン実践", time: "15:15-16:45", isCollected: true },
      { id: 5, name: "アジャイル開発入門", time: "17:00-18:30", isCollected: false },
      { id: 6, name: "データ分析ハンズオン", time: "10:00-11:30", isCollected: true },
    ],
  },
  {
    id: 7,
    name: "山本 大輔",
    affiliation: "グローバル商社 IT部門",
    interests: "ノーコード・ローコード開発",
    twitterId: "yamamoto_daisuke",
    stamps: [
      { id: 1, name: "プログラミング入門ワークショップ", time: "10:00-11:30", isCollected: false },
      { id: 2, name: "デザイン思考体験セミナー", time: "11:45-13:15", isCollected: true },
      { id: 3, name: "Web開発基礎講座", time: "13:30-15:00", isCollected: false },
      { id: 4, name: "UIUXデザイン実践", time: "15:15-16:45", isCollected: false },
      { id: 5, name: "アジャイル開発入門", time: "17:00-18:30", isCollected: true },
      { id: 6, name: "データ分析ハンズオン", time: "10:00-11:30", isCollected: false },
    ],
  },
  {
    id: 8,
    name: "中村 あい",
    affiliation: "ヘルステック企業 開発部",
    interests: "アクセシビリティの向上方法",
    twitterId: "nakamura_ai",
    stamps: [
      { id: 1, name: "プログラミング入門ワークショップ", time: "10:00-11:30", isCollected: true },
      { id: 2, name: "デザイン思考体験セミナー", time: "11:45-13:15", isCollected: true },
      { id: 3, name: "Web開発基礎講座", time: "13:30-15:00", isCollected: true },
      { id: 4, name: "UIUXデザイン実践", time: "15:15-16:45", isCollected: true },
      { id: 5, name: "アジャイル開発入門", time: "17:00-18:30", isCollected: true },
      { id: 6, name: "データ分析ハンズオン", time: "10:00-11:30", isCollected: true },
    ],
  },
];

// localStorageと同期するユーザープロフィールatom
export const userProfileAtom = atomWithStorage<UserProfile | null>(
  "gopher_stamp_rally_user_profile",
  null
);

// スタンプのatom（userProfileから派生）
export const stampsAtom = atom<Stamp[], [Stamp[]], void>(
  (get) => {
    const profile = get(userProfileAtom);
    if (profile) {
      return profile.stamps;
    }
    // デフォルトのスタンプ
    return [
      { id: 1, name: "プログラミング入門ワークショップ", time: "10:00-11:30", isCollected: false },
      { id: 2, name: "デザイン思考体験セミナー", time: "11:45-13:15", isCollected: false },
      { id: 3, name: "Web開発基礎講座", time: "13:30-15:00", isCollected: false },
      { id: 4, name: "UIUXデザイン実践", time: "15:15-16:45", isCollected: false },
      { id: 5, name: "アジャイル開発入門", time: "17:00-18:30", isCollected: false },
      { id: 6, name: "データ分析ハンズオン", time: "10:00-11:30", isCollected: false },
    ];
  },
  (get, set, newStamps: Stamp[]) => {
    const profile = get(userProfileAtom);
    if (profile) {
      const completedCount = newStamps.filter((s) => s.isCollected).length;
      set(userProfileAtom, {
        ...profile,
        stamps: newStamps,
        completedCount,
      });
    }
  }
);

// 参加者リストのatom（userProfileから派生）
export const participantsAtom = atom<Participant[]>((get) => {
  const profile = get(userProfileAtom);
  if (profile) {
    const myParticipant: Participant = {
      id: MY_PROFILE_ID,
      name: profile.nickname,
      completedCount: profile.completedCount,
      totalCount: profile.totalCount,
      profileImageUrl: profile.profileImageUrl,
      isMine: true,
    };
    return [myParticipant, ...mockParticipants];
  }
  return mockParticipants;
});

// UI状態のatoms
export const selectedParticipantAtom = atom<ParticipantDetailData | null>(null);
export const isDetailOpenAtom = atom(false);
export const showRegistrationDialogAtom = atom(false);

// ユーザープロフィールが存在するかどうかを確認するatom
export const hasUserProfileAtom = atom<boolean>((get) => {
  return get(userProfileAtom) !== null;
});

