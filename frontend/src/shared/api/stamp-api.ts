import { listStamps, getStamp, getStampOTP } from "./generated/stamps/stamps";
import { acquireStamp } from "./generated/user-stamps/user-stamps";
import type { AcquireStampRequest, UserStamp, Stamp } from "./generated/api.schemas";

export async function fetchStampList(limit: number = 100, offset: number = 0) {
  const response = await listStamps({ limit, offset });
  return {
    stamps: response.stamps || [],
    total: response.total || 0,
  };
}

export async function fetchStampDetail(stampId: number): Promise<{ id: number; name: string }> {
  const stamp = await getStamp(stampId);
  return {
    id: stamp.id,
    name: stamp.name,
  };
}

/**
 * スタンプ取得API
 * POST /users/{user_id}/stamps
 */
export async function acquireStampApi(
  userId: number,
  stampId: number,
  otp: string
): Promise<UserStamp> {
  const request: AcquireStampRequest = {
    stamp_id: stampId,
    otp,
  };
  return await acquireStamp(userId, request);
}

export async function getStampOtpApi(stampId: number): Promise<{ otp?: string }> {
  return await getStampOTP(stampId);
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
    // HTTPエラーの判定
    const errorMessage = error.message.toLowerCase();
    if (errorMessage.includes("409") || errorMessage.includes("already")) {
      return {
        message: "既に取得済みのスタンプです",
        details: error.message,
        type: "already_acquired",
      };
    }
    if (errorMessage.includes("404") || errorMessage.includes("not found")) {
      return {
        message: "スタンプが見つかりません",
        details: error.message,
        type: "not_found",
      };
    }
    if (errorMessage.includes("400") || errorMessage.includes("invalid")) {
      return {
        message: "リクエストが不正です",
        details: error.message,
        type: "invalid_request",
      };
    }
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
