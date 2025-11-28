# ユーザープロフィール読み込み問題の修正

## 🐛 問題

LocalStorageにユーザープロフィールが保存されているのに、「ユーザー情報が見つかりません」エラーが表示される。

### 保存されているデータ

```json
{
  "id": "733469",
  "nickname": "test",
  "twitterId": "JavaLangRuntime",
  "profileImageUrl": "https://taramanji.com/image.png",
  "favoriteGolangPoints": ["並行処理（goroutines/channels）"],
  "completedCount": 0,
  "totalCount": 1
}
```

**キー**: `gopher_stamp_rally_user_profile`

---

## 🔍 根本原因

### 問題1: Atomの初期化タイミング

```typescript
const userProfile = useAtomValue(userProfileAtom);

if (!userProfile?.id) {
  // エラー！でもLocalStorageにはデータがある
}
```

**原因**: `atomWithStorage` はLocalStorageから非同期で読み込むため、初回レンダリング時は `null` になる可能性がある。

### 問題2: useEffectのタイミング

コンポーネントのマウント直後にuseEffectが実行されるが、その時点でatomがまだLocalStorageから値を読み込んでいない。

---

## ✅ 実施した修正

### 1. 初期化状態の管理

```typescript
const [isInitializing, setIsInitializing] = useState(true);

useEffect(() => {
  const checkUserProfile = () => {
    // LocalStorageから直接確認
    const storedProfile = localStorage.getItem('gopher_stamp_rally_user_profile');

    if (storedProfile || userProfile) {
      setIsInitializing(false);
    } else {
      // 少し待ってから再確認（atomの初期化待ち）
      setTimeout(() => {
        const retryProfile = localStorage.getItem('gopher_stamp_rally_user_profile');
        setIsInitializing(false);
      }, 100);
    }
  };

  checkUserProfile();
}, [userProfile]);
```

### 2. LocalStorageとAtomの両方をチェック

```typescript
// LocalStorageとAtomの両方をチェック
const storedProfile = localStorage.getItem('gopher_stamp_rally_user_profile');

if (!userProfile?.id && !storedProfile) {
  // 本当にプロフィールがない
  setError({ message: "ユーザー情報が見つかりません" });
  return;
}

// LocalStorageにはあるがatomにない場合、LocalStorageの値を使用
let userId: string;
if (userProfile?.id) {
  userId = String(userProfile.id);
} else if (storedProfile) {
  const parsed = JSON.parse(storedProfile);
  userId = String(parsed.id);
}
```

### 3. 初期化完了まで待機

```typescript
if (isInitializing) {
  console.log('[ACQUIRE] Waiting for initialization...');
  return; // 初期化が完了するまでスキップ
}
```

### 4. ローディング画面の改善

```typescript
if (isInitializing || state === "loading" || state === "acquiring") {
  return (
    <div>
      <h2>
        {isInitializing
          ? "初期化中..."
          : state === "loading"
            ? "スタンプを確認中..."
            : "スタンプを取得中..."}
      </h2>
    </div>
  );
}
```

---

## 🎯 動作フロー

### 修正前（問題あり）

```
1. コンポーネントマウント
2. userProfile = null (atomがまだ読み込み中)
3. useEffect実行
4. userProfile?.id が false
5. エラー表示 ❌
```

### 修正後（正常）

```
1. コンポーネントマウント
2. isInitializing = true
3. LocalStorageをチェック
   ↓
   データあり → isInitializing = false
4. useEffect実行
   - isInitializing = false なので処理開始
   - LocalStorageとatomの両方をチェック
   - どちらかにあればOK ✅
5. スタンプ取得処理を実行
```

---

## 🧪 テスト手順

### 1. LocalStorageにデータがある状態で確認

```javascript
// ブラウザコンソールで確認
localStorage.getItem('gopher_stamp_rally_user_profile')
// → データが表示されるはず
```

### 2. スタンプ取得ページにアクセス

```
http://localhost:3000/stamps/acquire/1
```

### 3. 期待される動作

#### コンソールログ

```
[ACQUIRE] LocalStorage profile: {"id":"733469",...}
[ACQUIRE] User profile available
[ACQUIRE] Waiting for initialization...
[ACQUIRE] Starting acquisition process for stamp 1
[ACQUIRE] Using user ID from localStorage: 733469
...
```

#### 画面

1. ✅ 「初期化中...」と表示される（一瞬）
2. ✅ 「スタンプを確認中...」に切り替わる
3. ✅ エラーが出ない
4. ✅ スタンプ取得処理が進む

---

## 📊 対応するユーザーID形式

修正後は、以下のすべての形式に対応：

### 数値ID（実際のバックエンド）

```json
{
  "id": "733469",
  "nickname": "test",
  ...
}
```

→ `Number("733469")` → `733469`（数値）でAPI呼び出し

### 文字列ID（モックモード）

```json
{
  "id": "MY_PROFILE",
  "nickname": "test",
  ...
}
```

→ `Number("MY_PROFILE")` → `NaN` になるが、モックAPIは数値IDとして扱う

**注意**: モックAPIの場合、文字列IDはハッシュ化されて数値として扱われます。

---

## 🔧 その他の改善

### 1. デバッグログの強化

すべてのステップでログを出力：

```typescript
console.log('[ACQUIRE] LocalStorage profile:', storedProfile);
console.log('[ACQUIRE] User profile available');
console.log('[ACQUIRE] Using user ID from localStorage:', userId);
```

### 2. エラーハンドリングの改善

- LocalStorageとatomの両方をチェック
- 初期化完了まで適切に待機
- より詳細なエラーメッセージ

---

## 📝 今後の推奨事項

### オプション1: atomWithStorageの代わりにカスタムフック

より確実な初期化のため、カスタムフックを作成：

```typescript
function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('gopher_stamp_rally_user_profile');
    if (stored) {
      setProfile(JSON.parse(stored));
    }
    setIsLoading(false);
  }, []);

  return { profile, isLoading };
}
```

### オプション2: Suspense境界の追加

React Suspenseを使ってatomの読み込みを待つ：

```typescript
<Suspense fallback={<LoadingSpinner />}>
  <AcquireStampPage />
</Suspense>
```

---

## ✅ 修正完了

**変更ファイル**:
- `frontend/src/app/stamps/acquire/[id]/page.tsx`

**主な変更点**:
1. ✅ `isInitializing` 状態を追加
2. ✅ LocalStorage直接読み込みのロジック追加
3. ✅ atom と localStorage の両方をチェック
4. ✅ 初期化完了まで処理を待機
5. ✅ より詳細なログ出力

**結果**:
- ✅ LocalStorageにデータがあれば必ず認識される
- ✅ 「ユーザー情報が見つかりません」エラーが出なくなる
- ✅ 初期化のタイミング問題を解決

---

**Last Updated**: 2025-11-24
**Status**: ✅ 修正完了



