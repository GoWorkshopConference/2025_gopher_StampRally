/**
 * モックAPIクライアント
 * バックエンドが実装されるまでの開発用
 */

import type { Stamp, UserStamp, AcquireStampRequest } from "./generated/api.schemas";

// 環境変数でモックモードを制御
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true";

// モックスタンプデータ
const MOCK_STAMPS: Stamp[] = [
  {
    id: 1,
    name: "Go基礎セッション",
  },
  {
    id: 2,
    name: "並行処理マスター",
  },
  {
    id: 3,
    name: "Webアプリ開発",
  },
  {
    id: 4,
    name: "マイクロサービス",
  },
  {
    id: 5,
    name: "パフォーマンス最適化",
  },
  {
    id: 6,
    name: "プロダクション運用",
  },
];

// 取得済みスタンプを保存（モック用）
const mockAcquiredStamps = new Map<number, Set<number>>();

/**
 * モックのスタンプ詳細取得
 */
export async function mockGetStamp(id: number): Promise<Stamp> {
  // 実際のAPIのように少し待つ
  await new Promise(resolve => setTimeout(resolve, 300));

  const stamp = MOCK_STAMPS.find(s => s.id === id);
  if (!stamp) {
    throw new Error(`404: Stamp with id ${id} not found`);
  }

  return stamp;
}

/**
 * モックのスタンプ取得API
 */
export async function mockAcquireStamp(
  userId: number,
  request: AcquireStampRequest
): Promise<UserStamp> {
  // 実際のAPIのように少し待つ
  await new Promise(resolve => setTimeout(resolve, 500));

  const stampId = request.stamp_id;

  // スタンプが存在するか確認
  const stamp = MOCK_STAMPS.find(s => s.id === stampId);
  if (!stamp) {
    throw new Error(`404: Stamp with id ${stampId} not found`);
  }

  // ユーザーの取得済みスタンプを取得
  if (!mockAcquiredStamps.has(userId)) {
    mockAcquiredStamps.set(userId, new Set());
  }
  const userStamps = mockAcquiredStamps.get(userId)!;

  // 既に取得済みかチェック
  if (userStamps.has(stampId)) {
    throw new Error(`409: Stamp ${stampId} is already acquired by user ${userId}`);
  }

  // スタンプを追加
  userStamps.add(stampId);

  console.log(`[MOCK API] User ${userId} acquired stamp ${stampId}`);
  console.log(`[MOCK API] User stamps:`, Array.from(userStamps));

  return {
    user_id: userId,
    stamp_id: stampId,
  };
}

/**
 * モックのユーザースタンプ一覧取得
 */
export async function mockListUserStamps(userId: number): Promise<{ stamps: UserStamp[] }> {
  await new Promise(resolve => setTimeout(resolve, 200));

  const userStamps = mockAcquiredStamps.get(userId);
  if (!userStamps || userStamps.size === 0) {
    return { stamps: [] };
  }

  return {
    stamps: Array.from(userStamps).map((stampId) => ({
      user_id: userId,
      stamp_id: stampId,
    })),
  };
}

/**
 * モックモードが有効かどうか
 */
export function isMockMode(): boolean {
  return USE_MOCK_API;
}

/**
 * モックモードの状態をログ出力
 */
export function logMockMode(): void {
  if (USE_MOCK_API) {
    console.log(
      "%c[MOCK MODE] %cAPI calls are mocked. Set NEXT_PUBLIC_USE_MOCK_API=false to use real API.",
      "background: #fbbf24; color: #000; font-weight: bold; padding: 2px 8px; border-radius: 3px;",
      "color: #f59e0b;"
    );
  } else {
    console.log(
      "%c[REAL API MODE] %cUsing real backend API.",
      "background: #10b981; color: #fff; font-weight: bold; padding: 2px 8px; border-radius: 3px;",
      "color: #059669;"
    );
  }
}



