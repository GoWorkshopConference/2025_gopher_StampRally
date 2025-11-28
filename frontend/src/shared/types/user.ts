export interface UserProfile {
    id: string;
    nickname: string;
    twitterId: string;
    profileImageUrl: string;
    favoriteGolangPoints: string[];
    completedCount: number;
    totalCount: number;
}

export const GOLANG_POINTS = [
    "並行処理（goroutines/channels）",
    "インターフェース",
    "エラーハンドリング",
    "パフォーマンス",
    "標準ライブラリ",
    "テスト",
    "デプロイ",
    "ミドルウェア",
    "型システム",
    "パッケージ管理",
    "ベストプラクティス",
    "メモリ管理",
] as const;

export type GolangPoint = (typeof GOLANG_POINTS)[number];














