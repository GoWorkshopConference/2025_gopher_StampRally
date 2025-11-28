import {UserProfile} from "../types/user";

const STORAGE_KEY = "gopher_stamp_rally_user_profile";

export function getUserProfile(): UserProfile | null {
    if (typeof window === "undefined") return null;

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return null;
        return JSON.parse(stored) as UserProfile;
    } catch {
        return null;
    }
}

export function saveUserProfile(profile: UserProfile): void {
    if (typeof window === "undefined") return;

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (error) {
        console.error("Failed to save user profile:", error);
    }
}

export function updateUserProfile(updates: Partial<UserProfile>): UserProfile | null {
    const current = getUserProfile();
    if (!current) return null;

    const updated = {...current, ...updates};
    saveUserProfile(updated);
    return updated;
}

export function hasUserProfile(): boolean {
    return getUserProfile() !== null;
}

export function generateUserId(): string {
    // APIでは数値IDを想定しているため、ランダムな数値IDを生成
    // 実際のアプリではバックエンドから取得したIDを使用
    return Math.floor(Math.random() * 1000000 + 1).toString();
}














