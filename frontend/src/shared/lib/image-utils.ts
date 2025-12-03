/**
 * 画像をbase64に変換するユーティリティ関数
 */

/**
 * URLから画像を取得してbase64に変換
 * @param url 画像のURL
 * @returns base64エンコードされた画像（data URL形式）
 * @throws 画像の取得や変換に失敗した場合
 */
export async function urlToBase64(url: string): Promise<string> {
    try {
        // URLの検証
        if (!url || !url.trim()) {
            throw new Error('画像URLが空です');
        }

        // fetch オプション: CORSエラーを回避するため、modeを設定
        const response = await fetch(url, {
            mode: 'cors',
            cache: 'no-cache',
        });

        if (!response.ok) {
            throw new Error(`画像の取得に失敗しました: ${response.status} ${response.statusText}`);
        }

        // Content-Typeの確認
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.startsWith('image/')) {
            console.warn(`警告: 取得したコンテンツが画像ではない可能性があります (Content-Type: ${contentType})`);
        }

        const blob = await response.blob();

        // Blobが空でないか確認
        if (blob.size === 0) {
            throw new Error('画像データが空です');
        }

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    resolve(reader.result);
                } else {
                    reject(new Error('画像のbase64変換に失敗しました'));
                }
            };
            reader.onerror = () => {
                reject(new Error('画像の読み込みに失敗しました'));
            };
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        // エラーの詳細をログに出力
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            console.error('CORSエラーまたはネットワークエラー:', error);
            throw new Error('画像URLへのアクセスが拒否されました。CORS設定を確認してください。');
        }
        console.error('画像URLからbase64への変換エラー:', error);
        throw error;
    }
}

/**
 * 画像URLまたはbase64文字列を正規化（base64に統一）
 * - 既にbase64（data:で始まる）場合はそのまま返す
 * - URLの場合はfetchしてbase64に変換
 * @param imageUrlOrBase64 画像URLまたはbase64文字列
 * @returns base64エンコードされた画像（data URL形式）
 * @throws 画像の取得や変換に失敗した場合
 */
export async function normalizeImageToBase64(imageUrlOrBase64: string): Promise<string> {
    // 空文字列の場合は空文字列を返す
    if (!imageUrlOrBase64 || !imageUrlOrBase64.trim()) {
        return '';
    }

    // 既にbase64（data URL）の場合はそのまま返す
    if (imageUrlOrBase64.startsWith('data:')) {
        return imageUrlOrBase64;
    }

    // URLの場合はbase64に変換
    if (imageUrlOrBase64.startsWith('http://') || imageUrlOrBase64.startsWith('https://')) {
        return await urlToBase64(imageUrlOrBase64);
    }

    // その他の場合はURLとして扱う（相対パスなど）
    // ただし、明らかにURLでない場合はエラーを投げる
    if (!imageUrlOrBase64.includes('/') && !imageUrlOrBase64.includes('.')) {
        throw new Error(`無効な画像URLです: ${imageUrlOrBase64}`);
    }

    return await urlToBase64(imageUrlOrBase64);
}

