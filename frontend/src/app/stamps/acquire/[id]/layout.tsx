import { Metadata } from "next";
import { getStamp } from "@/shared/api/generated/stamps/stamps";
import { getStampImagePath } from "@/shared/lib/stamp-image";

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const stampId = Number(params.id);

  if (isNaN(stampId)) {
    return {
      title: "スタンプ取得 - Gophers Stamp Rally",
      description: "Gophers Stamp Rally でスタンプをGETしよう！",
    };
  }

  try {
    const stamp = await getStamp(stampId);
    const stampImagePath = getStampImagePath(stamp.name);
    // 絶対URLを生成（metadataBaseが設定されていても明示的に指定）
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://2025-gopher-stamp-rally.vercel.app";
    const imageUrl = `${baseUrl}${stampImagePath}`;

    return {
      title: `スタンプ「${stamp.name}」をGET！ - Gophers Stamp Rally`,
      description: `🎉 Gophers Stamp Rally でスタンプ「${stamp.name}」をGETしました！ #GoWorkshopConference`,
      openGraph: {
        title: `スタンプ「${stamp.name}」をGET！`,
        description: `🎉 Gophers Stamp Rally でスタンプ「${stamp.name}」をGETしました！`,
        url: `${baseUrl}/stamps/acquire/${stampId}`,
        siteName: "Gophers Stamp Rally",
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: stamp.name,
          },
        ],
        type: "website",
        locale: "ja_JP",
      },
      twitter: {
        card: "summary_large_image",
        title: `スタンプ「${stamp.name}」をGET！`,
        description: `🎉 Gophers Stamp Rally でスタンプ「${stamp.name}」をGETしました！`,
        images: [imageUrl],
      },
    };
  } catch (error) {
    console.error("Failed to generate metadata for stamp:", error);
    return {
      title: "スタンプ取得 - Gophers Stamp Rally",
      description: "Gophers Stamp Rally でスタンプをGETしよう！",
    };
  }
}

export default function AcquireStampLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
