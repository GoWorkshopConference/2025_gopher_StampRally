import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAtomValue } from "jotai";
import { hasUserProfileAtom } from "@/shared/store/atoms";

/**
 * ユーザープロフィールの有無をチェックし、未登録の場合はメインページにリダイレクト
 */
export function useAuthRedirect() {
  const router = useRouter();
  const hasUserProfile = useAtomValue(hasUserProfileAtom);

  useEffect(() => {
    if (!hasUserProfile) {
      router.replace("/");
    }
  }, [hasUserProfile, router]);

  return hasUserProfile;
}

