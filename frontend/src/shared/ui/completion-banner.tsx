import { Trophy } from "lucide-react";

interface CompletionBannerProps {
  className?: string;
}

export function CompletionBanner({ className = "" }: CompletionBannerProps) {
  return (
    <div className={`bg-gradient-to-r from-yellow-400 to-orange-400 text-white p-6 rounded-2xl shadow-2xl text-center animate-pulse ${className}`}>
      <Trophy className="w-16 h-16 mx-auto mb-3" fill="currentColor" />
      <h2 className="mb-2">🎉 コンプリート！ 🎉</h2>
      <p className="text-sm">全てのスタンプを集めました！</p>
    </div>
  );
}






