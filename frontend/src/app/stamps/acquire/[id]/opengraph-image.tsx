import { ImageResponse } from 'next/og';
import { getStampImagePath } from '@/shared/lib/stamp-image';

export const alt = 'Gophers Stamp Rally - スタンプ取得';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export const runtime = 'edge';

export default async function Image({
  params,
}: {
  params: { id: string };
}) {
  const stampId = Number(params.id);

  try {
    // APIからスタンプ情報を取得
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
    const stampResponse = await fetch(`${apiBaseUrl}/stamps/${stampId}`, {
      next: { revalidate: 3600 },
    });

    if (!stampResponse.ok) {
      throw new Error('Failed to fetch stamp');
    }

    const stamp = await stampResponse.json();

    // スタンプ画像のパスを取得
    const stampImagePath = getStampImagePath(stamp.name);
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://2025-gopher-stamp-rally.vercel.app';
    const imageUrl = `${baseUrl}${stampImagePath}`;

    // 画像を読み込む（Edge Runtimeでは直接URLを使用）
    // ImageResponseでは外部画像URLを直接使用できる

    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 60,
            background: 'linear-gradient(135deg, #ecfeff 0%, #dbeafe 100%)',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
          }}
        >
          {/* タイトル */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: 20,
              textAlign: 'center',
            }}
          >
            🎉 スタンプGET！ 🎉
          </div>

          {/* スタンプ画像と名前を含むコンテナ */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 30,
            }}
          >
            {/* スタンプ画像 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 300,
                height: 300,
                borderRadius: 20,
                backgroundColor: 'white',
                padding: 20,
              }}
            >
              <img
                src={imageUrl}
                alt={stamp.name}
                width={260}
                height={260}
                style={{
                  objectFit: 'contain',
                }}
              />
            </div>

            {/* スタンプ名 */}
            <div
              style={{
                fontSize: 48,
                fontWeight: 'bold',
                color: '#1f2937',
                textAlign: 'center',
              }}
            >
              {stamp.name}
            </div>

            {/* フッター */}
            <div
              style={{
                fontSize: 32,
                color: '#6b7280',
                marginTop: 20,
              }}
            >
              Gophers Stamp Rally #GWC2025
            </div>
          </div>
        </div>
      ),
      {
        ...size,
      }
    );
  } catch (error) {
    console.error('Failed to generate OG image:', error);
    // エラー時はデフォルト画像を返す
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 60,
            background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}
        >
          <div style={{ fontSize: 80, marginBottom: 20 }}>🎉</div>
          <div>Gophers Stamp Rally</div>
        </div>
      ),
      {
        ...size,
      }
    );
  }
}
