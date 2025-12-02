/**
 * スタンプAPI クライアント
 * Swagger定義に基づいたAPI呼び出しラッパー
 */

import { acquireStamp } from "./generated/user-stamps/user-stamps";
import { getStamp, listStamps } from "./generated/stamps/stamps";
import { mockGetStamp, mockAcquireStamp, isMockMode } from "./mock-client";
import type { Stamp, AcquireStampRequest, UserStamp } from "./generated/api.schemas";

/**
 * スタンプ詳細取得
 * GET /stamps/{id}
 * 
 * @param stampId - スタンプID
 * @returns スタンプ詳細
 * @throws 404: スタンプが見つからない
 * @throws 500: サーバーエラー
 */
export async function fetchStampDetail(stampId: number): Promise<Stamp> {
  try {
    if (isMockMode()) {
      console.log(`[STAMP API] Fetching stamp detail (MOCK): ${stampId}`);
      return await mockGetStamp(stampId);
    }

    console.log(`[STAMP API] Fetching stamp detail: ${stampId}`);
    return await getStamp(stampId);
  } catch (error) {
    console.error(`[STAMP API] Failed to fetch stamp ${stampId}:`, error);
    throw error;
  }
}

/**
 * スタンプ一覧取得
 * GET /stamps
 * 
 * @param limit - 取得件数（デフォルト: 100）
 * @param offset - オフセット（デフォルト: 0）
 * @returns スタンプ一覧
 */
export async function fetchStampList(
  limit: number = 100,
  offset: number = 0
): Promise<{ stamps: Stamp[]; total: number }> {
  try {
    console.log(`[STAMP API] Fetching stamp list (limit: ${limit}, offset: ${offset})`);
    const response = await listStamps({ limit, offset });
    
    return {
      stamps: response.stamps || [],
      total: response.total || 0,
    };
  } catch (error) {
    console.error("[STAMP API] Failed to fetch stamp list:", error);
    throw error;
  }
}

/**
 * スタンプ取得API
 * POST /users/{user_id}/stamps
 * 
 * Swagger定義:
 * - operationId: acquireStamp
 * - summary: ユーザーがスタンプを取得
 * - description: ユーザーが新しいスタンプを取得する
 * 
 * @param userId - ユーザーID
 * @param stampId - 取得するスタンプのID
 * @returns 取得結果
 * @throws 400: リクエストが不正
 * @throws 404: ユーザーまたはスタンプが見つからない
 * @throws 409: 既に取得済みのスタンプ
 * @throws 500: サーバーエラー
 */
export async function acquireStampApi(
  userId: number,
  stampId: number
): Promise<UserStamp> {
  try {
    const request: AcquireStampRequest = {
      stamp_id: stampId,
    };

    if (isMockMode()) {
      console.log(`[STAMP API] Acquiring stamp (MOCK) - User: ${userId}, Stamp: ${stampId}`);
      return await mockAcquireStamp(userId, request);
    }

    console.log(`[STAMP API] Acquiring stamp - User: ${userId}, Stamp: ${stampId}`);
    const response = await acquireStamp(userId, request);
    
    console.log(`[STAMP API] Successfully acquired stamp ${stampId} for user ${userId}`);
    return response;
  } catch (error) {
    console.error(
      `[STAMP API] Failed to acquire stamp ${stampId} for user ${userId}:`,
      error
    );
    
    // エラーの種類を判定
    if (error instanceof Error) {
      if (error.message.includes("409")) {
        throw new StampAlreadyAcquiredError(stampId);
      }
      if (error.message.includes("404")) {
        throw new StampNotFoundError(stampId);
      }
      if (error.message.includes("400")) {
        throw new InvalidRequestError(error.message);
      }
    }
    
    throw error;
  }
}

/**
 * カスタムエラークラス
 */
export class StampApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StampApiError";
  }
}

export class StampNotFoundError extends StampApiError {
  constructor(stampId: number) {
    super(`Stamp with ID ${stampId} not found`);
    this.name = "StampNotFoundError";
  }
}

export class StampAlreadyAcquiredError extends StampApiError {
  constructor(stampId: number) {
    super(`Stamp with ID ${stampId} is already acquired`);
    this.name = "StampAlreadyAcquiredError";
  }
}

export class InvalidRequestError extends StampApiError {
  constructor(details: string) {
    super(`Invalid request: ${details}`);
    this.name = "InvalidRequestError";
  }
}

/**
 * エラーハンドリングヘルパー
 */
export function handleStampApiError(error: unknown): {
  message: string;
  details?: string;
  type: "not_found" | "already_acquired" | "invalid_request" | "unknown";
} {
  if (error instanceof StampNotFoundError) {
    return {
      message: "スタンプが見つかりません",
      details: error.message,
      type: "not_found",
    };
  }

  if (error instanceof StampAlreadyAcquiredError) {
    return {
      message: "既に取得済みのスタンプです",
      details: error.message,
      type: "already_acquired",
    };
  }

  if (error instanceof InvalidRequestError) {
    return {
      message: "リクエストが不正です",
      details: error.message,
      type: "invalid_request",
    };
  }

  if (error instanceof Error) {
    return {
      message: "スタンプの取得に失敗しました",
      details: error.message,
      type: "unknown",
    };
  }

  return {
    message: "予期しないエラーが発生しました",
    details: String(error),
    type: "unknown",
  };
}



