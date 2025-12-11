"use client";

import {useRef, useState} from "react";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,} from "@/shared/ui/dialog";
import {Button} from "@/shared/ui/button";
import {Input} from "@/shared/ui/input";
import {Label} from "@/shared/ui/label";
import {Checkbox} from "@/shared/ui/checkbox";
import {useSetAtom} from "jotai";
import {GOLANG_POINTS, GOLANG_POINT_CODE_MAP, UserProfile} from "@/shared/types/user";
import {generateUserId} from "@/shared/lib/storage";
import {userProfileAtom} from "@/shared/store/atoms";
import {ImageWithFallback} from "@/shared/lib/ImageWithFallback";
import {createUser} from "@/shared/api/generated/users/users";
import {LoadingSpinner} from "@/shared/ui/loading-spinner";

interface UserRegistrationDialogProps {
    open: boolean;
    onComplete: (profile: UserProfile) => void;
}

export function UserRegistrationDialog({open, onComplete}: UserRegistrationDialogProps) {
    const setUserProfile = useSetAtom(userProfileAtom);
    const [nickname, setNickname] = useState("");
    const [twitterId, setTwitterId] = useState("");
    const [profileImageUrl, setProfileImageUrl] = useState("");
    const [selectedPoints, setSelectedPoints] = useState<string[]>([]);
    const [imagePreview, setImagePreview] = useState<string>("");
    const [isFileUploaded, setIsFileUploaded] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setImagePreview(result);
                setProfileImageUrl(result);
                setIsFileUploaded(true); // ファイルアップロード時はURL入力欄を非表示
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePointToggle = (point: string) => {
        setSelectedPoints((prev) =>
            prev.includes(point) ? prev.filter((p) => p !== point) : [...prev, point]
        );
    };

    const handleSubmit = async () => {
        if (!nickname.trim()) {
            alert("ニックネームは必須です");
            return;
        }

        if (selectedPoints.length === 0) {
            alert("好きなGolangポイントを少なくとも1つ選択してください");
            return;
        }

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
                    // その他の場合は空文字列
                    iconValue = "";
                }
            }

            // バックエンドに保存する値は「コード」（英数字）に変換する
            const favoriteGoFeatureCodes = selectedPoints.map((label) => GOLANG_POINT_CODE_MAP[label as keyof typeof GOLANG_POINT_CODE_MAP] ?? label);
            const favoriteGoFeature = favoriteGoFeatureCodes.join(",");
            const apiUser = await createUser(
                {
                    name: nickname.trim(),
                    twitter_id: twitterId.trim() || undefined,
                    favorite_go_feature: favoriteGoFeature,
                    icon: iconValue || undefined,
                },
            );

            // バックエンドのユーザーIDをフロントのプロフィールに反映
            // LocalStorageにはURLまたはbase64画像を保存
            const profile: UserProfile = {
                id: String(apiUser.id),
                nickname: apiUser.name,
                twitterId: apiUser.twitter_id ?? twitterId.trim(),
                profileImageUrl: iconValue || "",
                favoriteGolangPoints: selectedPoints,
                completedCount: 0,
                totalCount: 0, // APIから取得した総数で後で更新される
            };

            setUserProfile(profile);
            setIsSubmitting(false);
            onComplete(profile);
        } catch (error) {
            console.error("Failed to register user:", error);
            setIsSubmitting(false);
            alert("ユーザー登録に失敗しました。時間をおいて再度お試しください。");
        }
    };

    return (
        <Dialog open={open} onOpenChange={() => {
        }}>
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
                        <Label htmlFor="twitterId" className="text-gray-900">TwitterID（任意・公開されます）</Label>
                        <Input
                            id="twitterId"
                            placeholder="例: @gopher_taro"
                            value={twitterId}
                            onChange={(e) => setTwitterId(e.target.value)}
                            className="bg-white text-gray-900 border-gray-300"
                        />
                        <p className="text-xs text-gray-500">
                            入力したTwitterIDは参加者一覧などで公開されます。未入力でも参加できます。
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="profileImage" className="text-gray-900">プロフィール画像</Label>
                        <div className="flex items-center gap-4">
                            {imagePreview && imagePreview.trim() !== "" && (
                                <div
                                    className="w-20 h-20 rounded-full overflow-hidden border-2 border-cyan-300 relative">
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
                        {!isFileUploaded && (
                            <Input
                                id="profileImageUrl"
                                placeholder="画像URL（オプション）"
                                value={profileImageUrl}
                                onChange={(e) => {
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
                                }}
                                className="bg-white text-gray-900 border-gray-300"
                            />
                        )}
                        <p className="text-xs text-gray-500">
                            {isFileUploaded
                                ? "画像をアップロードしました。別の画像を選択する場合は、再度「画像を選択」ボタンをクリックしてください。"
                                : "ファイルを選択するか、画像のURLを入力してください"}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-gray-900">好きなGolangポイント *（複数選択可）</Label>
                        <div
                            className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 border border-gray-300 rounded-md bg-white">
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
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        登録する
                    </Button>
                </DialogFooter>
            </DialogContent>

            {isSubmitting && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-2xl p-8 shadow-2xl">
                        <LoadingSpinner message="登録中..." />
                    </div>
                </div>
            )}
        </Dialog>
    );
}

