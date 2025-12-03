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
    'ブースA || 個人展示': '/gwc-a-individual.png',
    'ブースA': '/gwc-a-individual.png',
    'ブースB': '/gwc-ebitengine.png',
    'ブースC': '/gwc-c-game.png',
    'Wall企画1': '/gwc-a-wall.png',
    'Wall企画2': '/gwc-b-wall.png',
    'Wall企画3': '/gwc-c-wall.png',
  };

  return nameMap[stampName] || '/gwc-a-wall.png'; // デフォルト画像
}

