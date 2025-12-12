"use client";

import { useState, useRef } from "react";
import { StampImageDetail } from "@/shared/ui/stamp-image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Camera, X as XIcon, ArrowRight } from "lucide-react";
import { getStampImagePath } from "@/shared/lib/stamp-image";

interface StampDetailDialogProps {
  stamp: {
    id: number;
    name: string;
  } | null;
  isAcquired: boolean;
  open: boolean;
  onClose: () => void;
}

function getStampDescription(stampName: string): string | null {
  // スタンプ名の前後の空白を除去して比較
  const trimmedName = stampName.trim();

  switch (trimmedName) {
    case "午前ワークショップ":
      return "10:30 ~ 12:30のKIITOホールで行われるワークショップに参加しよう！";
    case "午後ワークショップ":
      return "15:45 ~ 17:45のKIITOホールで行われるワークショップに参加しよう！";
    case "シャッフルランチ || 個人展示":
      return "ギャラリーAでブースAで12:30 - 14:00に開かれるシャッフルランチに参加しよう！";
    case "ジェスチャーゲーム":
      return "ギャラリーAでブースBで開かれるジェスチャーゲームに参加しよう！";
    case "Go製のゲーム展示":
      return "ギャラリーAでブースCで10:30 - 14:00 & 15:30 - 17:45に開かれるGo製のゲーム展示・ゲーム作りブースに参加しよう！";
    case "Gopher Wall1":
      return "ギャラリーAにあるGopher Wall1「Goの開発スタイル」にPost Itを貼ろう！";
    case "Gopher Wall2":
      return "ギャラリーAにあるGopher Wall2「Goのリリースごとでの思い出」にPost Itを貼ろう！";
    case "Gopher Wall3":
      return "ギャラリーAにあるGopher Wall3「Go のここが好き！」にPost Itを貼ろう！";
    default:
      return null;
  }
}

export function StampDetailDialog({
  stamp,
  isAcquired,
  open,
  onClose,
}: StampDetailDialogProps) {
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  if (!stamp) return null;

  const description = getStampDescription(stamp.name);

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

  // カード部分を画像として生成
  const generateCardImage = async (): Promise<Blob | null> => {
    try {
      setIsGeneratingImage(true);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return null;
      }

      const scale = 2;
      const width = 400;
      const height = 520;
      canvas.width = width * scale;
      canvas.height = height * scale;
      ctx.scale(scale, scale);

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

      const imagePath = getStampImagePath(stamp.name);
      const img = new Image();
      img.crossOrigin = 'anonymous';

      return new Promise((resolve) => {
        img.onload = () => {
          // グラデーション背景
          const gradient = ctx.createLinearGradient(0, 110, 0, 360);
          gradient.addColorStop(0, '#ecfeff');
          gradient.addColorStop(1, '#dbeafe');
          ctx.fillStyle = gradient;
          roundRect(ctx, 30, 110, 340, 290, 16);
          ctx.fill();

          // スタンプ画像
          const maxSize = 160;
          const imgAspectRatio = img.naturalWidth / img.naturalHeight;
          let drawWidth = maxSize;
          let drawHeight = maxSize;

          if (imgAspectRatio > 1) {
            drawHeight = maxSize / imgAspectRatio;
          } else {
            drawWidth = maxSize * imgAspectRatio;
          }

          const imgX = (width - drawWidth) / 2;
          const imgY = 130 + (maxSize - drawHeight) / 2;
          ctx.drawImage(img, imgX, imgY, drawWidth, drawHeight);

          // スタンプ名
          ctx.fillStyle = '#1f2937';
          ctx.font = 'bold 22px system-ui, sans-serif';
          ctx.fillText(stamp.name, width / 2, 315);

          // スタンプIDの背景
          const badgeText = `スタンプ #${stamp.id}`;
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
          ctx.fillText('#GWC2025', width / 2, 480);

          canvas.toBlob((blob) => {
            setIsGeneratingImage(false);
            resolve(blob);
          }, 'image/png');
        };

        img.onerror = () => {
          // プレースホルダー
          const gradient = ctx.createLinearGradient(0, 110, 0, 360);
          gradient.addColorStop(0, '#ecfeff');
          gradient.addColorStop(1, '#dbeafe');
          ctx.fillStyle = gradient;
          roundRect(ctx, 30, 110, 340, 290, 16);
          ctx.fill();

          ctx.fillStyle = '#e5e7eb';
          roundRect(ctx, 120, 130, 160, 160, 12);
          ctx.fill();

          ctx.font = '48px sans-serif';
          ctx.fillStyle = '#6b7280';
          ctx.fillText('🎯', width / 2, 210);

          ctx.fillStyle = '#1f2937';
          ctx.font = 'bold 22px system-ui, sans-serif';
          ctx.fillText(stamp.name, width / 2, 315);

          const badgeText = `スタンプ #${stamp.id}`;
          ctx.font = 'bold 14px system-ui, sans-serif';
          const badgeWidth = ctx.measureText(badgeText).width + 24;
          const badgeX = (width - badgeWidth) / 2;
          const badgeY = 345;

          ctx.fillStyle = '#cffafe';
          roundRect(ctx, badgeX, badgeY, badgeWidth, 30, 15);
          ctx.fill();

          ctx.fillStyle = '#0891b2';
          ctx.fillText(badgeText, width / 2, badgeY + 15);

          ctx.fillStyle = '#9ca3af';
          ctx.font = '14px system-ui, sans-serif';
          ctx.fillText('Gophers Stamp Rally', width / 2, 450);
          ctx.fillText('#GWC2025', width / 2, 480);

          canvas.toBlob((blob) => {
            setIsGeneratingImage(false);
            resolve(blob);
          }, 'image/png');
        };

        img.src = imagePath;
      });
    } catch (error) {
      console.error('[IMAGE] Image generation failed:', error);
      setIsGeneratingImage(false);
      return null;
    }
  };

  // 画像をダウンロード
  const downloadCardImage = async () => {
    const blob = await generateCardImage();
    if (!blob) {
      alert('画像の生成に失敗しました');
      return;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const filename = `gopher-stamp-${stamp.id}-${Date.now()}.png`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Xでシェア（OGP付きURLを共有）
  const shareOnX = async () => {
    const text = `🎉 Gophers Stamp Rally でスタンプ「${stamp.name}」をGETしました！ #GWC2025`;
    const shareUrl = `${window.location.origin}/stamps/acquire/${stamp.id}?go=haukfhakjh`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>{stamp.name}</DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          <StampImageDetail stampName={stamp.name} isAcquired={isAcquired} />
        </div>
        {description && (
          <div className="mb-4 rounded-lg bg-cyan-50 p-4">
            <p className="text-sm leading-relaxed text-gray-900">{description}</p>
          </div>
        )}
        {isAcquired && (
          <div className="space-y-3 mb-4">
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
          </div>
        )}
        <Button
          onClick={onClose}
          className="w-full bg-cyan-500 text-white hover:bg-cyan-600"
        >
          閉じる
        </Button>
      </DialogContent>
    </Dialog>
  );
}

