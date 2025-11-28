"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QrCode, Zap, Check, ExternalLink } from "lucide-react";
import { AppLayout } from "@/widgets/app-layout/ui/app-layout";
import { AppHeader } from "@/widgets/app-header/ui/app-header";

/**
 * スタンプ取得テストページ
 * 開発・テスト用に各スタンプへのリンクを提供
 */
export default function StampTestPage() {
  const router = useRouter();
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const stamps = [
    { id: 1, name: "スタンプ #1", color: "from-red-400 to-pink-500" },
    { id: 2, name: "スタンプ #2", color: "from-orange-400 to-yellow-500" },
    { id: 3, name: "スタンプ #3", color: "from-green-400 to-emerald-500" },
    { id: 4, name: "スタンプ #4", color: "from-cyan-400 to-blue-500" },
    { id: 5, name: "スタンプ #5", color: "from-blue-400 to-indigo-500" },
    { id: 6, name: "スタンプ #6", color: "from-purple-400 to-pink-500" },
  ];

  const handleAcquire = (stampId: number) => {
    router.push(`/stamps/acquire/${stampId}`);
  };

  const handleCopyUrl = (stampId: number) => {
    const url = `${window.location.origin}/stamps/acquire/${stampId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(stampId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenQRGenerator = (stampId: number) => {
    const url = `${window.location.origin}/stamps/acquire/${stampId}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
    window.open(qrCodeUrl, "_blank");
  };

  return (
    <AppLayout>
      <AppHeader
        title="スタンプ取得テスト"
        icon={<Zap className="w-6 h-6" fill="currentColor" />}
      />

      <div className="max-w-2xl mx-auto p-6">
        {/* 説明 */}
        <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-amber-900 mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            開発・テスト用ページ
          </h2>
          <p className="text-amber-800 mb-4">
            このページは開発・テスト用です。各スタンプの取得URLを簡単にテストできます。
          </p>
          <div className="text-sm text-amber-700 space-y-2">
            <p>✅ <strong>取得テスト</strong>: ボタンをクリックしてスタンプ取得フローをテスト</p>
            <p>📋 <strong>URLコピー</strong>: NFCタグ書き込み用のURLをコピー</p>
            <p>📱 <strong>QRコード</strong>: スマホテスト用のQRコードを生成</p>
          </div>
        </div>

        {/* スタンプリスト */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            スタンプ一覧（全6種類）
          </h3>

          {stamps.map((stamp) => (
            <div
              key={stamp.id}
              className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-xl font-bold text-gray-800">
                    {stamp.name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    ID: {stamp.id}
                  </p>
                </div>
                <div
                  className={`w-16 h-16 rounded-full bg-gradient-to-br ${stamp.color} flex items-center justify-center text-white text-2xl font-bold shadow-lg`}
                >
                  {stamp.id}
                </div>
              </div>

              <div className="space-y-2">
                {/* 取得テストボタン */}
                <button
                  onClick={() => handleAcquire(stamp.id)}
                  className={`w-full bg-gradient-to-r ${stamp.color} text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group`}
                >
                  <Zap className="w-5 h-5" />
                  <span>取得テスト</span>
                  <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                </button>

                {/* URLコピーボタン */}
                <button
                  onClick={() => handleCopyUrl(stamp.id)}
                  className="w-full bg-gray-100 text-gray-700 font-semibold py-2.5 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  {copiedId === stamp.id ? (
                    <>
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-green-600">コピーしました！</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      <span>URLをコピー</span>
                    </>
                  )}
                </button>

                {/* QRコード生成ボタン */}
                <button
                  onClick={() => handleOpenQRGenerator(stamp.id)}
                  className="w-full bg-indigo-50 text-indigo-700 font-semibold py-2.5 px-4 rounded-lg hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <QrCode className="w-4 h-4" />
                  <span>QRコード生成</span>
                </button>
              </div>

              {/* URL表示 */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-1">取得URL:</p>
                <code className="text-xs bg-gray-50 text-gray-700 px-3 py-2 rounded block overflow-x-auto">
                  {typeof window !== "undefined" &&
                    `${window.location.origin}/stamps/acquire/${stamp.id}`}
                </code>
              </div>
            </div>
          ))}
        </div>

        {/* 注意事項 */}
        <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-blue-900 mb-3">📝 NFCタグへの書き込み手順</h3>
          <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
            <li>上記の「URLをコピー」ボタンでURLをコピー</li>
            <li>NFC書き込みアプリ（NFC Tools等）を起動</li>
            <li>「URLレコード」または「Webサイト」を選択</li>
            <li>コピーしたURLを貼り付け</li>
            <li>NFCタグに書き込み</li>
            <li>スマートフォンでスキャンしてテスト</li>
          </ol>
        </div>

        {/* スタンプ一覧へのリンク */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push("/stamps")}
            className="inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-semibold"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span>スタンプ一覧へ戻る</span>
          </button>
        </div>
      </div>
    </AppLayout>
  );
}


