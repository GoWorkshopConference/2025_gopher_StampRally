"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAtomValue } from "jotai";
import { Button } from "@/shared/ui/button";
import { List, Users, User } from "lucide-react";
import { userProfileAtom } from "@/shared/store/atoms";

export function AppFooter() {
  const router = useRouter();
  const pathname = usePathname();
  const userProfile = useAtomValue(userProfileAtom);

  const isStampsPage = pathname === "/stamps" || pathname === "/";
  const isParticipantsPage = pathname === "/participants";
  const isProfilePage = pathname === "/profile";

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-cyan-200 shadow-lg z-50">
      <div className="max-w-md mx-auto flex gap-2 p-2">
        <Button
          onClick={() => router.push("/stamps")}
          variant={isStampsPage ? "default" : "outline"}
          className={`flex-1 ${
            isStampsPage
              ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
              : "border-cyan-300 text-cyan-600 hover:bg-cyan-50"
          }`}
        >
          <List className="w-4 h-4 mr-2" />
          スタンプラリー
        </Button>
        <Button
          onClick={() => router.push("/participants")}
          variant={isParticipantsPage ? "default" : "outline"}
          className={`flex-1 ${
            isParticipantsPage
              ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
              : "border-cyan-300 text-cyan-600 hover:bg-cyan-50"
          }`}
        >
          <Users className="w-4 h-4 mr-2" />
          参加者一覧
        </Button>
        {userProfile && (
          <Button
            onClick={() => router.push("/profile")}
            variant={isProfilePage ? "default" : "outline"}
            className={`px-3 ${
              isProfilePage
                ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                : "border-cyan-300 text-cyan-600 hover:bg-cyan-50"
            }`}
            title="プロフィール"
          >
            <User className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

