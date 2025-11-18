"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Checkbox } from "@/shared/ui/checkbox";
import { useSetAtom } from "jotai";
import { UserProfile, GOLANG_POINTS } from "@/shared/types/user";
import { generateUserId } from "@/shared/lib/storage";
import { userProfileAtom } from "@/shared/store/atoms";
import { ImageWithFallback } from "@/shared/lib/ImageWithFallback";

interface UserRegistrationDialogProps {
  open: boolean;
  onComplete: (profile: UserProfile) => void;
}

export function UserRegistrationDialog({ open, onComplete }: UserRegistrationDialogProps) {
  const setUserProfile = useSetAtom(userProfileAtom);
  const [nickname, setNickname] = useState("");
  const [twitterId, setTwitterId] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [selectedPoints, setSelectedPoints] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setProfileImageUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePointToggle = (point: string) => {
    setSelectedPoints((prev) =>
      prev.includes(point) ? prev.filter((p) => p !== point) : [...prev, point]
    );
  };

  const handleSubmit = () => {
    if (!nickname.trim() || !twitterId.trim()) {
      alert("ニックネームとTwitterIDは必須です");
      return;
    }

    if (selectedPoints.length === 0) {
      alert("好きなGolangポイントを少なくとも1つ選択してください");
      return;
    }

    const profile: UserProfile = {
      id: generateUserId(),
      nickname: nickname.trim(),
      twitterId: twitterId.trim(),
      profileImageUrl: profileImageUrl || "",
      favoriteGolangPoints: selectedPoints,
      completedCount: 0,
      totalCount: 6,
      stamps: [
        { id: 1, name: "プログラミング入門ワークショップ", time: "10:00-11:30", isCollected: false },
        { id: 2, name: "デザイン思考体験セミナー", time: "11:45-13:15", isCollected: false },
        { id: 3, name: "Web開発基礎講座", time: "13:30-15:00", isCollected: false },
        { id: 4, name: "UIUXデザイン実践", time: "15:15-16:45", isCollected: false },
        { id: 5, name: "アジャイル開発入門", time: "17:00-18:30", isCollected: false },
        { id: 6, name: "データ分析ハンズオン", time: "10:00-11:30", isCollected: false },
      ],
    };

    setUserProfile(profile);
    onComplete(profile);
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-md max-h-[90vh] overflow-y-auto bg-white [&>button]:hidden"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-gray-900">ユーザー登録</DialogTitle>
          <DialogDescription className="text-gray-600">
            GoWorkShopConferenceのGophers Stamp Rally企画に参加するための情報を入力してください
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-gray-900">
          <div className="space-y-2">
            <Label htmlFor="nickname" className="text-gray-900">ニックネーム *</Label>
            <Input
              id="nickname"
              placeholder="例: Gopher太郎"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="bg-white text-gray-900 border-gray-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="twitterId" className="text-gray-900">TwitterID *</Label>
            <Input
              id="twitterId"
              placeholder="例: @gopher_taro"
              value={twitterId}
              onChange={(e) => setTwitterId(e.target.value)}
              className="bg-white text-gray-900 border-gray-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profileImage" className="text-gray-900">プロフィール画像</Label>
            <div className="flex items-center gap-4">
              {imagePreview && (
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-cyan-300 relative">
                  <ImageWithFallback
                    src={imagePreview}
                    alt="プロフィール画像プレビュー"
                  />
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex-shrink-0"
              >
                画像を選択
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />
            </div>
            <Input
              id="profileImageUrl"
              placeholder="画像URL（オプション）"
              value={profileImageUrl && !profileImageUrl.startsWith("data:") ? profileImageUrl : ""}
              onChange={(e) => {
                const url = e.target.value;
                if (url && !url.startsWith("data:")) {
                  setProfileImageUrl(url);
                  setImagePreview(url);
                } else if (!url) {
                  // URLが空の場合は、ファイルから選択された画像があればそれを保持
                  if (!imagePreview || imagePreview.startsWith("data:")) {
                    setProfileImageUrl("");
                    setImagePreview("");
                  }
                }
              }}
              className="bg-white text-gray-900 border-gray-300"
            />
            <p className="text-xs text-gray-500">
              ファイルを選択するか、画像のURLを入力してください
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-900">好きなGolangポイント *（複数選択可）</Label>
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 border border-gray-300 rounded-md bg-white">
              {GOLANG_POINTS.map((point) => (
                <div key={point} className="flex items-center space-x-2">
                  <Checkbox
                    id={point}
                    checked={selectedPoints.includes(point)}
                    onCheckedChange={() => handlePointToggle(point)}
                  />
                  <label
                    htmlFor={point}
                    className="text-sm cursor-pointer flex-1 text-gray-900"
                  >
                    {point}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-xs text-blue-800">
              ⚠️ この情報はGoWorkShopConferenceのGophers Stamp Rally企画でのみ使用されます。
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
          >
            登録する
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

