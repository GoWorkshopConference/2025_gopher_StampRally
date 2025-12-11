import { getStampImagePath } from "@/shared/lib/stamp-image";

interface StampImageProps {
  stampName: string;
  isAcquired: boolean;
  className?: string;
  size?: "small" | "medium" | "large";
}

const sizeClasses = {
  small: "w-12 h-12",
  medium: "w-24 h-24",
  large: "w-full h-48",
};

const blurIntensity = {
  small: "blur-sm",
  medium: "blur-sm",
  large: "blur-md", // ポップアップ用はより強いぼかし
};

export function StampImage({
  stampName,
  isAcquired,
  className = "",
  size = "medium",
}: StampImageProps) {
  const imagePath = getStampImagePath(stampName);
  const sizeClass = sizeClasses[size];
  const blurClass = isAcquired ? "" : `grayscale ${blurIntensity[size]}`;
  const shapeClass = size === "large" ? "rounded" : "rounded-full";

  return (
    <img
      src={imagePath}
      alt={stampName}
      className={`${sizeClass} ${shapeClass} object-cover transition-all duration-300 select-none ${blurClass} ${className}`}
      draggable={false}
      onContextMenu={(e) => e.preventDefault()}
      onError={(e) => {
        const size = sizeClass.includes("12") ? 48 : sizeClass.includes("24") ? 96 : 400;
        e.currentTarget.src = `https://via.placeholder.com/${size}?text=Stamp`;
      }}
    />
  );
}

// ポップアップ用の大きな画像（より強いぼかし）
interface StampImageDetailProps {
  stampName: string;
  isAcquired: boolean;
  className?: string;
}

export function StampImageDetail({
  stampName,
  isAcquired,
  className = "",
}: StampImageDetailProps) {
  const imagePath = getStampImagePath(stampName);
  const blurClass = isAcquired ? "" : "grayscale blur-lg";

  return (
    <img
      src={imagePath}
      alt={stampName}
      className={`w-full h-48 object-contain rounded transition-all duration-300 select-none ${blurClass} ${className}`}
      draggable={false}
      onContextMenu={(e) => e.preventDefault()}
      onError={(e) => {
        e.currentTarget.src = "https://via.placeholder.com/400x300?text=Stamp";
      }}
    />
  );
}
