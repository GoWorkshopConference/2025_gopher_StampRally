"use client";

import {Suspense, useCallback, useEffect, useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {useAtom, useAtomValue} from "jotai";
import {UserRegistrationDialog} from "@/widgets/user-registration/ui/user-registration-dialog";
import {AppLayout} from "@/widgets/app-layout/ui/app-layout";
import {FirstVisitPopup} from "@/shared/ui/first-visit-popup";
import {hasUserProfileAtom, showRegistrationDialogAtom, userProfileAtom,} from "@/shared/store/atoms";
import {UserProfile} from "@/shared/types/user";

const STORAGE_KEY = "kiito-first-visit-popup-seen";
const USER_PROFILE_STORAGE_KEY = "gopher_stamp_rally_user_profile";

// localStorageから直接ユーザープロフィールの存在をチェックする関数
function checkStoredUserProfile(): boolean {
    if (typeof window === "undefined") return false;
    try {
        const storedProfile = localStorage.getItem(USER_PROFILE_STORAGE_KEY);
        if (!storedProfile) return false;
        const parsed = JSON.parse(storedProfile);
        return parsed && parsed.id;
    } catch {
        return false;
    }
}

function HomeContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [showRegistrationDialog, setShowRegistrationDialog] = useAtom(showRegistrationDialogAtom);
    const [userProfile, setUserProfile] = useAtom(userProfileAtom);
    const hasUserProfile = useAtomValue(hasUserProfileAtom);
    const [showFirstVisitPopup, setShowFirstVisitPopup] = useState(false);

    useEffect(() => {
        // Twitter OGP経由など from=twitter が付与されている、またはリファラがtwitterの場合はスタンプページへ
        const fromParam = searchParams.get("from");
        const isFromTwitterParam = fromParam === "twitter";
        const isTwitterReferrer = typeof document !== "undefined" && document.referrer.includes("twitter.com");
        if (isFromTwitterParam || isTwitterReferrer) {
            router.replace("/stamps");
            return;
        }

        // localStorageから直接ユーザー情報をチェック（atomの初期化を待たない）
        const hasStoredProfile = checkStoredUserProfile();
        if (hasStoredProfile) {
            // プロフィールがある場合は即座にスタンプラリーページにリダイレクト
            router.replace("/stamps");
            return;
        }

        // 初めての方へのポップアップをチェック
        try {
            const seen = localStorage.getItem(STORAGE_KEY);
            if (!seen) {
                setShowFirstVisitPopup(true);
                return; // ポップアップが表示される間はユーザー登録を待つ
            }
        } catch {
            // プライベートモード等の場合はポップアップを表示
            setShowFirstVisitPopup(true);
            return;
        }

        // 無効なユーザーIDをチェック（既存のユーザーで文字列IDの場合）
        if (userProfile && isNaN(Number(userProfile.id))) {
            console.warn('Invalid user ID detected, clearing profile');
            setUserProfile(null);
            setShowRegistrationDialog(true);
            return;
        }

        // 初回起動時にユーザープロフィールをチェック
        // localStorageにプロフィールがない場合のみ登録ダイアログを表示
        if (!hasStoredProfile && !hasUserProfile) {
            setShowRegistrationDialog(true);
        } else if (hasUserProfile || hasStoredProfile) {
            // プロフィールがある場合はスタンプラリーページにリダイレクト
            router.replace("/stamps");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasUserProfile, router, searchParams]);

    const handleFirstVisitPopupClose = useCallback(() => {
        setShowFirstVisitPopup(false);
        try {
            localStorage.setItem(STORAGE_KEY, "true");
        } catch {
            // 無視
        }
        // ポップアップが閉じられた後にユーザー登録ダイアログを表示
        // localStorageにプロフィールがない場合のみ表示
        const hasStoredProfile = checkStoredUserProfile();
        if (!hasStoredProfile && !hasUserProfile) {
            setShowRegistrationDialog(true);
        } else if (hasStoredProfile || hasUserProfile) {
            // プロフィールがある場合はスタンプラリーページにリダイレクト
            router.replace("/stamps");
        }
    }, [hasUserProfile, setShowRegistrationDialog, router]);

    const handleRegistrationComplete = useCallback(
        (profile: UserProfile) => {
            setUserProfile(profile);
            setShowRegistrationDialog(false);
            router.push("/stamps");
        },
        [setUserProfile, setShowRegistrationDialog, router]
    );

    return (
        <AppLayout>
            {showFirstVisitPopup && (
                <FirstVisitPopup onClose={handleFirstVisitPopupClose} />
            )}
            <UserRegistrationDialog
                open={showRegistrationDialog && !showFirstVisitPopup && !checkStoredUserProfile() && !hasUserProfile}
                onComplete={handleRegistrationComplete}
            />
        </AppLayout>
    );
}

export default function Home() {
    return (
        <Suspense fallback={
            <AppLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-gray-600">読み込み中...</p>
                    </div>
                </div>
            </AppLayout>
        }>
            <HomeContent />
        </Suspense>
    );
}
