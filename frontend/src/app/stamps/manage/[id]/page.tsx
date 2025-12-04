"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getStampOtpApi, fetchStampDetail } from "@/shared/api/stamp-api";
import { Stamp } from "@/shared/api/generated/api.schemas";
import { Loader2, RefreshCw } from "lucide-react";

export default function StampManagerPage() {
  const params = useParams();
  const stampId = Number(params.id);

  const [otp, setOtp] = useState<string>("");
  const [stamp, setStamp] = useState<Stamp | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(60);

  useEffect(() => {
    if (!stampId || isNaN(stampId)) {
      setError("無効なスタンプIDです");
      setLoading(false);
      return;
    }

    const init = async () => {
      try {
        const stampData = await fetchStampDetail(stampId);
        setStamp(stampData);
        await fetchOtp();
      } catch (err) {
        console.error(err);
        setError("スタンプ情報の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [stampId]);

  const fetchOtp = async () => {
    try {
      const res = await getStampOtpApi(stampId);
      if (res.otp) {
        setOtp(res.otp);
      }
    } catch (err) {
      console.error("Failed to fetch OTP", err);
    }
  };

  useEffect(() => {
    // Update timer every second
    const timer = setInterval(() => {
      const now = new Date();
      const seconds = now.getSeconds();
      const remaining = 60 - seconds;
      setTimeLeft(remaining);

      // Fetch new OTP when minute changes (plus a small buffer)
      if (remaining === 60 || remaining === 0) {
        fetchOtp();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [stampId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full">
          <h1 className="text-red-500 text-xl font-bold mb-4">エラー</h1>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-300">
          {stamp?.name}
        </h1>
        <p className="text-gray-400 mb-12">スタンプ取得用 認証コード</p>

        <div className="bg-white text-gray-900 rounded-3xl p-12 shadow-2xl inline-block min-w-[300px] md:min-w-[500px]">
          <div className="text-8xl md:text-9xl font-mono font-bold tracking-widest mb-4">
            {otp || "----"}
          </div>
          
          <div className="flex items-center justify-center gap-2 text-gray-500 mt-8">
            <RefreshCw className={`w-5 h-5 ${timeLeft < 5 ? 'animate-spin' : ''}`} />
            <span className="text-lg">あと {timeLeft} 秒で更新</span>
          </div>
        </div>

        <div className="mt-12 text-gray-500 text-sm">
          <p>参加者にこの画面を見せて、4桁のコードを入力してもらってください。</p>
          <p>コードは1分ごとに自動的に更新されます。</p>
        </div>
      </div>
    </div>
  );
}
