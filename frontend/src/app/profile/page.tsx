"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Checkbox } from "@/shared/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { GOLANG_POINTS } from "@/shared/types/user";
import { userProfileAtom } from "@/shared/store/atoms";
import { ImageWithFallback } from "@/shared/lib/ImageWithFallback";
import { AppLayout } from "@/widgets/app-layout/ui/app-layout";
import { AppHeader } from "@/widgets/app-header/ui/app-header";
import { ArrowLeft, Save } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useAtom(userProfileAtom);
  const [nickname, setNickname] = useState("");
  const [twitterId, setTwitterId] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [selectedPoints, setSelectedPoints] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!userProfile) {
      router.replace("/stamps");
      return;
    }

    setNickname(userProfile.nickname);
    setTwitterId(userProfile.twitterId);
    setProfileImageUrl(userProfile.profileImageUrl || "");
    setSelectedPoints(userProfile.favoriteGolangPoints);
    setImagePreview(userProfile.profileImageUrl || "");
  }, [userProfile, router]);

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setProfileImageUrl(result);
    };
    reader.readAsDataURL(file);
  }, []);

  const handlePointToggle = useCallback((point: string) => {
    setSelectedPoints((prev) =>
      prev.includes(point) ? prev.filter((p) => p !== point) : [...prev, point]
    );
  }, []);

  const handleImageUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    if (url && !url.startsWith("data:")) {
      setProfileImageUrl(url);
      setImagePreview(url);
    } else if (!url) {
      if (!imagePreview || imagePreview.startsWith("data:")) {
        setProfileImageUrl("");
        setImagePreview("");
      }
    }
  }, [imagePreview]);

  const isValid = useMemo(() => {
    return nickname.trim().length > 0 && twitterId.trim().length > 0 && selectedPoints.length > 0;
  }, [nickname, twitterId, selectedPoints]);

  const handleSave = useCallback(() => {
    if (!isValid) {
      // バリデーションエラーメッセージを表示（将来的にトースト通知に置き換え可能）
      if (!nickname.trim() || !twitterId.trim()) {
        alert("ニックネームとTwitterIDは必須です");
        return;
      }
      if (selectedPoints.length === 0) {
        alert("好きなGolangポイントを少なくとも1つ選択してください");
        return;
      }
      return;
    }

    if (!userProfile) return;

    const updated = {
      ...userProfile,
      nickname: nickname.trim(),
      twitterId: twitterId.trim(),
      profileImageUrl: profileImageUrl,
      favoriteGolangPoints: selectedPoints,
    };

    setUserProfile(updated);
    // 成功メッセージを表示（将来的にトースト通知に置き換え可能）
    alert("プロフィールを更新しました");
    router.push("/stamps");
  }, [isValid, nickname, twitterId, selectedPoints, profileImageUrl, userProfile, setUserProfile, router]);

  const progressPercentage = useMemo(() => {
    if (!userProfile || userProfile.totalCount === 0) return 0;
    return (userProfile.completedCount / userProfile.totalCount) * 100;
  }, [userProfile]);

  const handleBack = useCallback(() => {
    router.push("/stamps");
  }, [router]);

  if (!userProfile) {
    return null;
  }

  return (
    <AppLayout>
      <AppHeader
        title="プロフィール編集"
        icon={
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="text-white hover:bg-white/20 -ml-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        }
      />

      <div className="max-w-md mx-auto p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>登録情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nickname">ニックネーム *</Label>
              <Input
                id="nickname"
                placeholder="例: Gopher太郎"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitterId">TwitterID *</Label>
              <Input
                id="twitterId"
                placeholder="例: @gopher_taro"
                value={twitterId}
                onChange={(e) => setTwitterId(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profileImage">プロフィール画像</Label>
              <div className="flex items-center gap-4">
                {(imagePreview || profileImageUrl) && (
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-cyan-300 flex-shrink-0 relative">
                    <ImageWithFallback
                      src={imagePreview || profileImageUrl}
                      alt="プロフィール画像"
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
                onChange={handleImageUrlChange}
              />
              <p className="text-xs text-gray-500">
                ファイルを選択するか、画像のURLを入力してください
              </p>
            </div>

            <div className="space-y-2">
              <Label>好きなGolangポイント *（複数選択可）</Label>
              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 border rounded-md">
                {GOLANG_POINTS.map((point) => (
                  <div key={point} className="flex items-center space-x-2">
                    <Checkbox
                      id={point}
                      checked={selectedPoints.includes(point)}
                      onCheckedChange={() => handlePointToggle(point)}
                    />
                    <label
                      htmlFor={point}
                      className="text-sm cursor-pointer flex-1"
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

            <Button
              onClick={handleSave}
              disabled={!isValid}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4 mr-2" />
              保存する
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>スタンプラリー進捗</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>収集スタンプ</span>
                <span className="font-bold text-cyan-600">
                  {userProfile.completedCount} / {userProfile.totalCount}
                </span>
              </div>
              <div className="w-full h-3 bg-cyan-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

