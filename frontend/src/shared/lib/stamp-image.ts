/**
 * スタンプ名から画像パスを取得するヘルパー関数
 */

/**
 * スタンプ名から画像ファイルパスを取得
 */
export function getStampImagePath(stampName: string): string {
  const nameMap: Record<string, string> = {
    '午前ワークショップ': '/gwc-am-workshop.png',
    '午後ワークショップ': '/gwc-pm-workshop.png',
    'シャッフルランチ || 個人展示': '/gwc-a-individual.png',
    'ブースA': '/gwc-a-individual.png',
    'ジェスチャーゲーム': '/gwc-c-game.png',
    'Go製のゲーム展示': '/gwc-ebitengine.png',
    'Gopher Wall1 ': '/gwc-a-wall.png',
    'Gopher Wall2': '/gwc-b-wall.png',
    'Gopher Wall3': '/gwc-c-wall.png',
  };

  return nameMap[stampName] || '/gwc-a-wall.png'; // デフォルト画像
}

