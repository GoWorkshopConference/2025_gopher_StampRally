"use client";

import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useRouter} from "next/navigation";
import {useAtom} from "jotai";
import {Button} from "@/shared/ui/button";
import {Input} from "@/shared/ui/input";
import {Label} from "@/shared/ui/label";
import {Checkbox} from "@/shared/ui/checkbox";
import {Card, CardContent, CardHeader, CardTitle} from "@/shared/ui/card";
import {GOLANG_POINTS, GOLANG_POINT_CODE_MAP} from "@/shared/types/user";
import {userProfileAtom} from "@/shared/store/atoms";
import {ImageWithFallback} from "@/shared/lib/ImageWithFallback";
import {AppLayout} from "@/widgets/app-layout/ui/app-layout";
import {AppHeader} from "@/widgets/app-header/ui/app-header";
import {ArrowLeft, Save} from "lucide-react";
import {updateUser} from "@/shared/api/generated/users/users";
import {LoadingSpinner} from "@/shared/ui/loading-spinner";

export default function ProfilePage() {
    const router = useRouter();
    const [userProfile, setUserProfile] = useAtom(userProfileAtom);
    const [nickname, setNickname] = useState("");
    const [twitterId, setTwitterId] = useState("");
    const [profileImageUrl, setProfileImageUrl] = useState("");
    const [selectedPoints, setSelectedPoints] = useState<string[]>([]);
    const [imagePreview, setImagePreview] = useState<string>("");
    const [isFileUploaded, setIsFileUploaded] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!userProfile) {
            router.replace("/stamps");
            return;
        }

        setNickname(userProfile.nickname);
        setTwitterId(userProfile.twitterId);
        const imageUrl = userProfile.profileImageUrl || "";
        setProfileImageUrl(imageUrl);
        setSelectedPoints(userProfile.favoriteGolangPoints);
        setImagePreview(imageUrl);
        // 既存の画像がbase64（ファイルアップロード）の場合は、URL入力欄を非表示
        setIsFileUploaded(imageUrl.startsWith("data:"));
    }, [userProfile, router]);

    const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            setImagePreview(result);
            setProfileImageUrl(result);
            setIsFileUploaded(true); // ファイルアップロード時はURL入力欄を非表示
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
        setProfileImageUrl(url);
        // URLが空でない場合のみプレビューを更新
        if (url) {
            setImagePreview(url);
        } else {
            setImagePreview("");
        }
        // URLを入力した場合は、ファイルアップロード状態を解除
        setIsFileUploaded(false);
    }, []);

    const isValid = useMemo(() => {
        return nickname.trim().length > 0 && selectedPoints.length > 0;
    }, [nickname, selectedPoints]);

    const handleSave = useCallback(async () => {
        if (!isValid) {
            // バリデーションエラーメッセージを表示（将来的にトースト通知に置き換え可能）
            if (!nickname.trim()) {
                alert("ニックネームは必須です");
                return;
            }
            if (selectedPoints.length === 0) {
                alert("好きなGolangポイントを少なくとも1つ選択してください");
                return;
            }
            return;
        }

        if (!userProfile) return;

        if (isSubmitting) {
            return; // 既に送信中の場合は何もしない
        }

        setIsSubmitting(true);

        try {
            // 画像の処理: URLの場合はそのまま保存、base64（ファイルアップロード）の場合はそのまま保存
            let iconValue = "";
            if (profileImageUrl && profileImageUrl.trim()) {
                // http://またはhttps://で始まる場合はURLとしてそのまま保存
                if (profileImageUrl.startsWith("http://") || profileImageUrl.startsWith("https://")) {
                    iconValue = profileImageUrl.trim();
                } else if (profileImageUrl.startsWith("data:")) {
                    // base64（ファイルアップロード）の場合はそのまま保存
                    iconValue = profileImageUrl;
                } else {
                    // その他の場合は既存の画像を保持
                    iconValue = userProfile.profileImageUrl || "";
                }
            }

            // TwitterID が空の場合は既存の値を維持（空文字で上書きしない）
            const sanitizedTwitter = twitterId.trim();
            const twitterToKeep = sanitizedTwitter === "" ? userProfile.twitterId : sanitizedTwitter;

            // LocalStorage用に保持している日本語ラベルはそのまま使い続ける
            // LocalStorageにはURLまたはbase64画像を保存
            const updated = {
                ...userProfile,
                nickname: nickname.trim(),
                twitterId: twitterToKeep ?? "",
                profileImageUrl: iconValue,
                favoriteGolangPoints: selectedPoints,
            };

            setUserProfile(updated);

            // バックエンドには英字コードのみを保存
            const favoriteGoFeatureCodes = selectedPoints.map(
                (label) => GOLANG_POINT_CODE_MAP[label as keyof typeof GOLANG_POINT_CODE_MAP] ?? label,
            );
            const favoriteGoFeature = favoriteGoFeatureCodes.join(",");

            const numericId = Number(userProfile.id);
            if (!Number.isNaN(numericId)) {
                await updateUser(numericId, {
                    name: nickname.trim(),
                    // 空文字の場合は送信せず、既存の値を保持
                    twitter_id: sanitizedTwitter === "" ? undefined : sanitizedTwitter,
                    favorite_go_feature: favoriteGoFeature,
                    icon: iconValue || undefined,
                });
            }

            setIsSubmitting(false);
            alert("プロフィールを更新しました");
            router.push("/stamps");
        } catch (error) {
            console.error("Failed to update profile on backend:", error);
            setIsSubmitting(false);
            alert("バックエンドへのプロフィール更新に失敗しました。時間をおいて再度お試しください。");
        }
    }, [isValid, nickname, twitterId, selectedPoints, profileImageUrl, userProfile, setUserProfile, router, isSubmitting]);

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
                        <ArrowLeft className="w-5 h-5"/>
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
                            <Label htmlFor="twitterId">TwitterID（任意・公開されます）</Label>
                            <Input
                                id="twitterId"
                                placeholder="例: @gopher_taro"
                                value={twitterId}
                                onChange={(e) => setTwitterId(e.target.value)}
                            />
                            <p className="text-xs text-gray-500">
                                入力したTwitterIDは参加者一覧などで公開されます。未入力でも参加できます。
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="profileImage">プロフィール画像</Label>
                            <div className="flex items-center gap-4">
                                {(imagePreview || profileImageUrl) && (imagePreview || profileImageUrl).trim() !== "" && (
                                    <div
                                        className="w-20 h-20 rounded-full overflow-hidden border-2 border-cyan-300 flex-shrink-0 relative">
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
                            {!isFileUploaded && (
                                <Input
                                    id="profileImageUrl"
                                    placeholder="画像URL（オプション）"
                                    value={profileImageUrl}
                                    onChange={handleImageUrlChange}
                                />
                            )}
                            <p className="text-xs text-gray-500">
                                {isFileUploaded
                                    ? "画像をアップロードしました。別の画像を選択する場合は、再度「画像を選択」ボタンをクリックしてください。"
                                    : "ファイルを選択するか、画像のURLを入力してください"}
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
                            disabled={!isValid || isSubmitting}
                            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="w-4 h-4 mr-2"/>
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
                                    style={{width: `${progressPercentage}%`}}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {isSubmitting && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-2xl p-8 shadow-2xl">
                        <LoadingSpinner message="更新中..." />
                    </div>
                </div>
            )}
        </AppLayout>
    );
}

