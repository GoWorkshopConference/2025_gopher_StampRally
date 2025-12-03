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

// DBには日本語ではなくコードを保存するためのマッピング
export const GOLANG_POINT_CODE_MAP: Record<GolangPoint, string> = {
    "並行処理（goroutines/channels）": "CONCURRENCY",
    "インターフェース": "INTERFACES",
    "エラーハンドリング": "ERROR_HANDLING",
    "パフォーマンス": "PERFORMANCE",
    "標準ライブラリ": "STD_LIB",
    "テスト": "TESTING",
    "デプロイ": "DEPLOYMENT",
    "ミドルウェア": "MIDDLEWARE",
    "型システム": "TYPE_SYSTEM",
    "パッケージ管理": "PACKAGE_MANAGEMENT",
    "ベストプラクティス": "BEST_PRACTICES",
    "メモリ管理": "MEMORY_MANAGEMENT",
};

// コードから日本語への逆マッピング
export const GOLANG_POINT_LABEL_MAP: Record<string, GolangPoint> = {
    "CONCURRENCY": "並行処理（goroutines/channels）",
    "INTERFACES": "インターフェース",
    "ERROR_HANDLING": "エラーハンドリング",
    "PERFORMANCE": "パフォーマンス",
    "STD_LIB": "標準ライブラリ",
    "TESTING": "テスト",
    "DEPLOYMENT": "デプロイ",
    "MIDDLEWARE": "ミドルウェア",
    "TYPE_SYSTEM": "型システム",
    "PACKAGE_MANAGEMENT": "パッケージ管理",
    "BEST_PRACTICES": "ベストプラクティス",
    "MEMORY_MANAGEMENT": "メモリ管理",
};

/**
 * 英字コード（カンマ区切り）を日本語ラベルの配列に変換
 * @param codes カンマ区切りの英字コード（例: "CONCURRENCY,TESTING"）
 * @returns 日本語ラベルの配列（例: ["並行処理（goroutines/channels）", "テスト"]）
 */
export function codesToLabels(codes: string | null | undefined): string[] {
    if (!codes || !codes.trim()) {
        return [];
    }
    return codes
        .split(",")
        .map(code => code.trim())
        .filter(code => code.length > 0)
        .map(code => {
            const mapped = GOLANG_POINT_LABEL_MAP[code];
            return mapped ? mapped : code;
        })
        .filter((label): label is string => typeof label === 'string');
}


















