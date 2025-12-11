"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAtomValue, useSetAtom } from "jotai";
import { Sparkles, CheckCircle2, XCircle, ArrowRight, X as XIcon, Camera } from "lucide-react";
import { userProfileAtom, addStampAtom, isStampAcquiredAtom } from "@/shared/store/atoms";
import {
  fetchStampDetail,
  acquireStampApi,
  handleStampApiError,
  StampNotFoundError,
  StampAlreadyAcquiredError,
} from "@/shared/api/stamp-api";
import { logMockMode } from "@/shared/api/mock-client";
import type { Stamp } from "@/shared/api/generated/api.schemas";
import { getStampImagePath } from "@/shared/lib/stamp-image";

type AcquisitionState = "loading" | "acquiring" | "success" | "error" | "already_acquired";

interface ErrorInfo {
  message: string;
  details?: string;
}

export default function AcquireStampPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const stampId = Number(params.id) || Number(searchParams.get("stamp_id"));

  const userProfile = useAtomValue(userProfileAtom);
  const addStamp = useSetAtom(addStampAtom);
  const checkIsAcquired = useAtomValue(isStampAcquiredAtom);

  const [state, setState] = useState<AcquisitionState>("loading");
  const [stamp, setStamp] = useState<Stamp | null>(null);
  const [error, setError] = useState<ErrorInfo | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // useEffectが複数回実行されるのを防ぐ
  const hasExecuted = useRef(false);
  // カード部分のref
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // roundRect ポリフィル
  const roundRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  // カード部分を画像として生成してダウンロード
  const generateCardImage = async (): Promise<Blob | null> => {
    if (!stamp) {
      console.error('[IMAGE] No stamp data available');
      return null;
    }

    try {
      console.log('[IMAGE] Starting image generation for stamp:', stamp.name);
      setIsGeneratingImage(true);

      // Canvasを作成（カードのサイズに合わせる）
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('[IMAGE] Failed to get canvas context');
        return null;
      }

      // 高解像度対応
      const scale = 2;
      const width = 400;
      const height = 520;
      canvas.width = width * scale;
      canvas.height = height * scale;
      ctx.scale(scale, scale);

      console.log('[IMAGE] Canvas created:', { width, height, scale });

      // 背景（白）+ 角丸
      ctx.fillStyle = '#ffffff';
      roundRect(ctx, 0, 0, width, height, 24);
      ctx.fill();

      // タイトル
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 28px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🎉 スタンプGET！ 🎉', width / 2, 45);

      // サブタイトル
      ctx.fillStyle = '#6b7280';
      ctx.font = '16px system-ui, sans-serif';
      ctx.fillText('おめでとうございます！', width / 2, 80);

      // スタンプ画像を読み込んで描画
      const img = new Image();
      img.crossOrigin = 'anonymous';

      const imagePath = getStampImagePath(stamp.name);
      console.log('[IMAGE] Loading stamp image from:', imagePath);

      return new Promise((resolve) => {
        img.onload = () => {
          console.log('[IMAGE] Stamp image loaded successfully');

          // グラデーション背景（内側のボックス）
          const gradient = ctx.createLinearGradient(0, 110, 0, 360);
          gradient.addColorStop(0, '#ecfeff');
          gradient.addColorStop(1, '#dbeafe');
          ctx.fillStyle = gradient;
          roundRect(ctx, 30, 110, 340, 290, 16);
          ctx.fill();

          // スタンプ画像（アスペクト比を保持）
          const maxSize = 160;
          const imgAspectRatio = img.naturalWidth / img.naturalHeight;
          let drawWidth = maxSize;
          let drawHeight = maxSize;

          // アスペクト比を保持してサイズを計算
          if (imgAspectRatio > 1) {
            // 横長の場合
            drawHeight = maxSize / imgAspectRatio;
          } else {
            // 縦長または正方形の場合
            drawWidth = maxSize * imgAspectRatio;
          }

          const imgX = (width - drawWidth) / 2;
          const imgY = 130 + (maxSize - drawHeight) / 2;
          ctx.drawImage(img, imgX, imgY, drawWidth, drawHeight);
          console.log('[IMAGE] Stamp image drawn at', { imgX, imgY, drawWidth, drawHeight, originalSize: { width: img.naturalWidth, height: img.naturalHeight } });

          // スタンプ名
          ctx.fillStyle = '#1f2937';
          ctx.font = 'bold 22px system-ui, sans-serif';
          ctx.fillText(stamp.name, width / 2, 315);

          // スタンプIDの背景
          const badgeText = `スタンプ #${stampId}`;
          ctx.font = 'bold 14px system-ui, sans-serif';
          const badgeWidth = ctx.measureText(badgeText).width + 24;
          const badgeX = (width - badgeWidth) / 2;
          const badgeY = 345;

          ctx.fillStyle = '#cffafe';
          roundRect(ctx, badgeX, badgeY, badgeWidth, 30, 15);
          ctx.fill();

          // スタンプIDテキスト
          ctx.fillStyle = '#0891b2';
          ctx.fillText(badgeText, width / 2, badgeY + 15);

          // フッター
          ctx.fillStyle = '#9ca3af';
          ctx.font = '14px system-ui, sans-serif';
          ctx.fillText('Gophers Stamp Rally', width / 2, 450);
          ctx.fillText('#GoWorkshopConference', width / 2, 480);

          // Blobに変換
          canvas.toBlob((blob) => {
            console.log('[IMAGE] Image generated successfully, blob size:', blob?.size);
            setIsGeneratingImage(false);
            resolve(blob);
          }, 'image/png');
        };

        img.onerror = (error) => {
          console.error('[IMAGE] Failed to load stamp image:', error);
          console.log('[IMAGE] Using placeholder instead');
          // 画像読み込み失敗時はプレースホルダーで続行

          // グラデーション背景
          const gradient = ctx.createLinearGradient(0, 110, 0, 360);
          gradient.addColorStop(0, '#ecfeff');
          gradient.addColorStop(1, '#dbeafe');
          ctx.fillStyle = gradient;
          roundRect(ctx, 30, 110, 340, 290, 16);
          ctx.fill();

          // プレースホルダー
          ctx.fillStyle = '#e5e7eb';
          roundRect(ctx, 120, 130, 160, 160, 12);
          ctx.fill();

          ctx.font = '48px sans-serif';
          ctx.fillStyle = '#6b7280';
          ctx.fillText('🎯', width / 2, 210);

          // スタンプ名とID
          ctx.fillStyle = '#1f2937';
          ctx.font = 'bold 22px system-ui, sans-serif';
          ctx.fillText(stamp.name, width / 2, 315);

          const badgeText = `スタンプ #${stampId}`;
          ctx.font = 'bold 14px system-ui, sans-serif';
          const badgeWidth = ctx.measureText(badgeText).width + 24;
          const badgeX = (width - badgeWidth) / 2;
          const badgeY = 345;

          ctx.fillStyle = '#cffafe';
          roundRect(ctx, badgeX, badgeY, badgeWidth, 30, 15);
          ctx.fill();

          ctx.fillStyle = '#0891b2';
          ctx.fillText(badgeText, width / 2, badgeY + 15);

          // フッター
          ctx.fillStyle = '#9ca3af';
          ctx.font = '14px system-ui, sans-serif';
          ctx.fillText('Gophers Stamp Rally', width / 2, 450);
          ctx.fillText('#GoWorkshopConference', width / 2, 480);

          canvas.toBlob((blob) => {
            console.log('[IMAGE] Placeholder image generated, blob size:', blob?.size);
            setIsGeneratingImage(false);
            resolve(blob);
          }, 'image/png');
        };

        img.src = imagePath;
        console.log('[IMAGE] Image loading started');
      });
    } catch (error) {
      console.error('[IMAGE] Image generation failed:', error);
      setIsGeneratingImage(false);
      return null;
    }
  };

  // 画像をダウンロード
  const downloadCardImage = async () => {
    console.log('[DOWNLOAD] Starting download...');
    const blob = await generateCardImage();
    if (!blob) {
      console.error('[DOWNLOAD] Failed to generate image blob');
      alert('画像の生成に失敗しました');
      return;
    }

    console.log('[DOWNLOAD] Creating download link...');
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const filename = `gopher-stamp-${stampId}-${Date.now()}.png`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    console.log('[DOWNLOAD] Download triggered:', filename);
  };

  // 画像をクリップボードにコピー
  const copyImageToClipboard = async (blob: Blob): Promise<boolean> => {
    try {
      // Clipboard APIを使用して画像をコピー
      if (navigator.clipboard && navigator.clipboard.write) {
        const item = new ClipboardItem({
          'image/png': blob,
        });
        await navigator.clipboard.write([item]);
        console.log('[SHARE] Image copied to clipboard');
        return true;
      }
      return false;
    } catch (error) {
      console.error('[SHARE] Failed to copy image to clipboard:', error);
      return false;
    }
  };

  // Xでシェア（OGP付きURLを共有）
  const shareOnX = async () => {
    const text = `🎉 Gophers Stamp Rally でスタンプ「${stamp?.name ?? ""}」をGETしました！ #GoWorkshopConference`;
    const shareUrl = `${window.location.origin}/?from=twitter`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  };

  // LocalStorageから直接ユーザープロフィールを取得
  useEffect(() => {
    // LocalStorageが読み込まれるのを待つ
    const checkUserProfile = () => {
      if (typeof window === 'undefined') return;

      const storedProfile = localStorage.getItem('gopher_stamp_rally_user_profile');
      console.log('[ACQUIRE] LocalStorage profile:', storedProfile);

      if (storedProfile || userProfile) {
        console.log('[ACQUIRE] User profile available');
        setIsInitializing(false);
      } else {
        console.log('[ACQUIRE] No user profile found');
        // 少し待ってから再確認（atomの初期化待ち）
        setTimeout(() => {
          const retryProfile = localStorage.getItem('gopher_stamp_rally_user_profile');
          if (retryProfile || userProfile) {
            setIsInitializing(false);
          } else {
            setIsInitializing(false);
            // プロフィールが本当にない場合
            if (!retryProfile && !userProfile) {
              setError({
                message: "ユーザー情報が見つかりません",
                details: "先にユーザー登録を行ってください"
              });
              setState("error");
            }
          }
        }, 100);
      }
    };

    checkUserProfile();
  }, [userProfile]);

  useEffect(() => {
    // 初期化中は待機
    if (isInitializing) {
      console.log('[ACQUIRE] Waiting for initialization...');
      return;
    }

    // 既に実行済みの場合はスキップ
    if (hasExecuted.current) {
      console.log('[ACQUIRE] Already executed, skipping...');
      return;
    }

    // モックモードのログ出力（初回のみ）
    logMockMode();

    if (!stampId || isNaN(stampId)) {
      setError({ message: "無効なスタンプIDです", details: `ID: ${params.id}` });
      setState("error");
      hasExecuted.current = true;
      return;
    }

    // LocalStorageとAtomの両方をチェック
    const storedProfile = typeof window !== 'undefined'
      ? localStorage.getItem('gopher_stamp_rally_user_profile')
      : null;

    if (!userProfile?.id && !storedProfile) {
      console.log('[ACQUIRE] No user profile found in atom or localStorage');
      setError({ message: "ユーザー情報が見つかりません", details: "先にユーザー登録を行ってください" });
      setState("error");
      hasExecuted.current = true;
      return;
    }

    // LocalStorageにはあるがatomにない場合、LocalStorageの値を使用
    let userId: string;
    if (userProfile?.id) {
      userId = String(userProfile.id);
      console.log('[ACQUIRE] Using user ID from atom:', userId);
    } else if (storedProfile) {
      const parsed = JSON.parse(storedProfile);
      userId = String(parsed.id);
      console.log('[ACQUIRE] Using user ID from localStorage:', userId);
    } else {
      setError({ message: "ユーザー情報が見つかりません", details: "先にユーザー登録を行ってください" });
      setState("error");
      hasExecuted.current = true;
      return;
    }

    // 実行済みフラグを立てる
    hasExecuted.current = true;
    console.log('[ACQUIRE] Starting acquisition process for stamp', stampId);

    // リダイレクト元の確認（SessionStorage）
    if (typeof window !== 'undefined') {
      const accessKey = `stamp_access_${stampId}`;
      const hasAccess = sessionStorage.getItem(accessKey);

      if (!hasAccess) {
        console.log('[ACQUIRE] Invalid access: No session token found');
        setError({
          message: "不正なアクセスです",
          details: "URLを正しく読み取ってアクセスしてください"
        });
        setState("error");
        return;
      }

      // オプション: 一度使用したら無効化する場合（リロード対策など）
      // sessionStorage.removeItem(accessKey);
      // ※ リロードでエラーになると不便な場合は削除しない
    }

    // スタンプ取得処理
    const acquireStampProcess = async () => {
      try {
        setState("loading");

        // 1. スタンプ詳細を取得
        console.log('[ACQUIRE] Fetching stamp detail...');
        const stampInfo = await fetchStampDetail(stampId);
        setStamp(stampInfo);

        // 2. 既に取得済みかチェック
        const isAlreadyAcquired = checkIsAcquired(stampId);
        console.log(`[ACQUIRE] Stamp ${stampId} already acquired:`, isAlreadyAcquired);

        if (isAlreadyAcquired) {
          console.log('[ACQUIRE] Stamp already acquired, treating as success (no backend/local storage writes)');
          setState("success");
          setShowAnimation(true);
          return;
        }

        // 3. スタンプ取得API呼び出し
        setState("acquiring");
        console.log('[ACQUIRE] Waiting 500ms for UI...');
        await new Promise(resolve => setTimeout(resolve, 500));

        const userIdNum = Number(userId);
        console.log(`[ACQUIRE] Calling API to acquire stamp ${stampId} for user ${userIdNum} (${userId})`);

        await acquireStampApi(userIdNum, stampId);

        // 4. ローカルストレージに追加
        console.log('[ACQUIRE] Adding to LocalStorage...');
        const success = addStamp(stampId);
        console.log(`[ACQUIRE] LocalStorage update result:`, success);

        if (success) {
          console.log('[ACQUIRE] Success! Showing animation...');
          setState("success");
          setShowAnimation(true);
        } else {
          throw new Error("スタンプの保存に失敗しました");
        }
      } catch (err) {
        console.error("[ACQUIRE] Error occurred:", err);

        // カスタムエラーハンドリング
        if (err instanceof StampAlreadyAcquiredError) {
          console.log('[ACQUIRE] Error: Stamp already acquired');
          setState("already_acquired");
          return;
        }

        if (err instanceof StampNotFoundError) {
          console.log('[ACQUIRE] Error: Stamp not found');
          setError({
            message: "スタンプが見つかりません",
            details: `スタンプID ${stampId} は存在しません`,
          });
          setState("error");
          return;
        }

        // その他のエラー
        const errorInfo = handleStampApiError(err);
        console.log('[ACQUIRE] Error:', errorInfo);
        setError({
          message: errorInfo.message,
          details: errorInfo.details,
        });
        setState("error");
      }
    };

    acquireStampProcess();

    // クリーンアップ関数
    return () => {
      console.log('[ACQUIRE] Component unmounting, cleaning up...');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stampId, isInitializing]); // stampIdとisInitializingを依存配列に含める

  // 初期化中またはローディング中
  if (isInitializing || state === "loading" || state === "acquiring") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="mb-8">
            <div className="w-32 h-32 mx-auto relative">
              <div className="absolute inset-0 border-8 border-white/30 rounded-full animate-ping"></div>
              <div className="absolute inset-0 border-8 border-t-white rounded-full animate-spin"></div>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            {isInitializing
              ? "初期化中..."
              : state === "loading"
                ? "スタンプを確認中..."
                : "スタンプを取得中..."}
          </h2>
          <div className="flex items-center justify-center gap-2 text-white/80">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <p>少々お待ちください</p>
          </div>
        </div>
      </div>
    );
  }

  // 取得成功
  if (state === "success" && stamp) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 flex items-center justify-center p-4 overflow-hidden">
        {/* 背景アニメーション */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            >
              <Sparkles
                className="text-white/40"
                size={16 + Math.random() * 24}
              />
            </div>
          ))}
        </div>

        {/* メインコンテンツ */}
        <div
          className={`relative z-10 max-w-md w-full transition-all duration-700 ${
            showAnimation ? "scale-100 opacity-100" : "scale-0 opacity-0"
          }`}
        >
          {/* 成功アイコン */}
          <div className="text-center mb-8">
            <div className="inline-block relative">
              <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
              <CheckCircle2
                className="relative w-24 h-24 text-white mx-auto animate-bounce"
                strokeWidth={2}
              />
            </div>
          </div>

          {/* スタンプカード */}
          <div
            ref={cardRef}
            className="bg-white rounded-3xl shadow-2xl p-8 mb-6 transform hover:scale-105 transition-transform"
          >
            <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
              🎉 スタンプGET！ 🎉
            </h1>
            <p className="text-center text-gray-600 mb-6">おめでとうございます！</p>

            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-6 mb-4">
              <div className="flex justify-center mb-4">
                <img
                  src={getStampImagePath(stamp.name)}
                  alt={stamp.name}
                  className="w-40 h-40 object-contain rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = "https://go.dev/images/gophers/ladder.svg";
                  }}
                />
              </div>
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
                {stamp.name}
              </h2>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <span className="bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full font-semibold">
                  スタンプ #{stampId}
                </span>
              </div>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="space-y-3">
            {/* カード画像をダウンロード */}
            <button
              onClick={downloadCardImage}
              disabled={isGeneratingImage}
              className="w-full bg-blue-600 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Camera className="w-5 h-5" />
              <span>{isGeneratingImage ? '画像生成中...' : 'カード画像を保存'}</span>
            </button>

            {/* Xでシェアボタン */}
            <button
              onClick={shareOnX}
              disabled={isGeneratingImage}
              className="w-full bg-black text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl hover:bg-gray-900 transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <XIcon className="w-5 h-5" />
              <span>X でシェア（画像付き）</span>
              <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
              <p className="text-white text-xs text-center">
                💡 モバイル: 画像を直接共有できます
                <br />
                PC: 画像をクリップボードにコピーして、Xで貼り付けてください
              </p>
            </div>

            {/* 閉じるボタン */}
            <button
              onClick={() => router.push("/stamps")}
              className="w-full bg-white text-emerald-600 font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
            >
              <span>閉じる</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 既に取得済み
  if (state === "already_acquired" && stamp) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
            <div className="mb-6">
              <CheckCircle2 className="w-20 h-20 text-amber-500 mx-auto" />
            </div>

            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              既に取得済みです
            </h1>

            {stamp && (
              <div className="bg-amber-50 rounded-2xl p-6 mb-6">
                <div className="flex justify-center mb-4">
                  <img
                    src={getStampImagePath(stamp.name)}
                    alt={stamp.name}
                    className="w-32 h-32 object-contain rounded-lg opacity-75"
                    onError={(e) => {
                      e.currentTarget.src = "https://go.dev/images/gophers/ladder.svg";
                    }}
                  />
                </div>
                <h2 className="text-xl font-bold text-gray-700 mb-2">
                  {stamp.name}
                </h2>
                <p className="text-sm text-gray-600">
                  このスタンプは既にコレクションに追加されています
                </p>
              </div>
            )}

            <button
              onClick={() => router.push("/stamps")}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
            >
              <span>スタンプ一覧を見る</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // エラー
  if (state === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-400 via-pink-500 to-purple-600 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
            <div className="mb-6">
              <XCircle className="w-20 h-20 text-red-500 mx-auto" />
            </div>

            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              エラーが発生しました
            </h1>

            {error && (
              <div className="bg-red-50 rounded-2xl p-6 mb-6 text-left">
                <p className="text-red-800 font-semibold mb-2">
                  {error.message}
                </p>
                {error.details && (
                  <p className="text-red-600 text-sm">
                    {error.details}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={() => router.push("/stamps")}
                className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
              >
                <span>スタンプ一覧へ戻る</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => router.push("/")}
                className="w-full bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-2xl hover:bg-gray-300 transition-all"
              >
                ホームへ戻る
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}


