"use client";

import {useCallback, useEffect} from "react";
import {useRouter} from "next/navigation";
import {useAtom, useAtomValue} from "jotai";
import {UserRegistrationDialog} from "@/widgets/user-registration/ui/user-registration-dialog";
import {AppLayout} from "@/widgets/app-layout/ui/app-layout";
import {hasUserProfileAtom, showRegistrationDialogAtom, userProfileAtom,} from "@/shared/store/atoms";
import {UserProfile} from "@/shared/types/user";

export default function Home() {
    const router = useRouter();
    const [showRegistrationDialog, setShowRegistrationDialog] = useAtom(showRegistrationDialogAtom);
    const [userProfile, setUserProfile] = useAtom(userProfileAtom);
    const hasUserProfile = useAtomValue(hasUserProfileAtom);

    useEffect(() => {
        // 無効なユーザーIDをチェック（既存のユーザーで文字列IDの場合）
        if (userProfile && isNaN(Number(userProfile.id))) {
            console.warn('Invalid user ID detected, clearing profile');
            setUserProfile(null);
            setShowRegistrationDialog(true);
            return;
        }

        // 初回起動時にユーザープロフィールをチェック
        if (!hasUserProfile) {
            setShowRegistrationDialog(true);
        } else {
            // プロフィールがある場合はスタンプラリーページにリダイレクト
            router.replace("/stamps");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasUserProfile, router]);

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
            <UserRegistrationDialog
                open={showRegistrationDialog}
                onComplete={handleRegistrationComplete}
            />
        </AppLayout>
    );
}
