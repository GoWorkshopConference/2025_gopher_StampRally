"use client";

import {useRef, useState} from "react";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,} from "@/shared/ui/dialog";
import {Button} from "@/shared/ui/button";
import {Input} from "@/shared/ui/input";
import {Label} from "@/shared/ui/label";
import {Checkbox} from "@/shared/ui/checkbox";
import {useSetAtom} from "jotai";
import {GOLANG_POINTS, UserProfile} from "@/shared/types/user";
import {generateUserId} from "@/shared/lib/storage";
import {userProfileAtom} from "@/shared/store/atoms";
import {ImageWithFallback} from "@/shared/lib/ImageWithFallback";

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

    const handleSubmit = async () => {
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
            totalCount: 0, // APIから取得した総数で後で更新される
        };

        setUserProfile(profile);
        onComplete(profile);
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
                        <Input
                            id="profileImageUrl"
                            placeholder="画像URL（オプション）"
                            value={profileImageUrl.startsWith("data:") ? "" : profileImageUrl}
                            onChange={(e) => {
                                const url = e.target.value;
                                setProfileImageUrl(url);
                                // URLが空でない場合のみプレビューを更新
                                // 空の場合は、ファイルから選択された画像を保持
                                if (url) {
                                    setImagePreview(url);
                                } else if (!imagePreview.startsWith("data:")) {
                                    // ファイル選択の画像がない場合はクリア
                                    setImagePreview("");
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
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                    >
                        登録する
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

