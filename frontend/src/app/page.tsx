"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { UserRegistrationDialog } from "@/widgets/user-registration/ui/user-registration-dialog";
import { AppLayout } from "@/widgets/app-layout/ui/app-layout";
import {
  userProfileAtom,
  showRegistrationDialogAtom,
  hasUserProfileAtom,
} from "@/shared/store/atoms";
import { UserProfile } from "@/shared/types/user";

export default function Home() {
  const router = useRouter();
  const [showRegistrationDialog, setShowRegistrationDialog] = useAtom(showRegistrationDialogAtom);
  const hasUserProfile = useAtomValue(hasUserProfileAtom);
  const setUserProfile = useSetAtom(userProfileAtom);

  useEffect(() => {
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
