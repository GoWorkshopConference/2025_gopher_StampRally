# React 状態管理 完全ガイド

## 目次

1. [はじめに](#はじめに)
2. [状態管理の基礎概念](#状態管理の基礎概念)
3. [React標準フック](#react標準フック)
4. [状態管理ライブラリ](#状態管理ライブラリ)
5. [選択ガイド](#選択ガイド)

---

## はじめに

このドキュメントでは、Reactにおける状態管理の手法を網羅的に解説します。React標準のフックから、人気のライブラリまで、それぞれの特徴、動作原理、ユースケースを実際のコード例とともに紹介します。

### 共通のユースケース

このガイドでは、理解を容易にするため、以下のシンプルなカウンターアプリを共通のユースケースとして使用します：

**要件:**
- カウント値の表示
- カウント値の増加/減少
- カウント値のリセット
- 複数のコンポーネントでカウント値を共有

---

## 状態管理の基礎概念

### 状態（State）とは？

状態とは、アプリケーションが動作する上で必要なデータのことです。ユーザーの操作や時間の経過によって変化し、UIの表示内容を決定します。

### 状態の分類

状態は大きく以下の3つに分類されます：

#### 1. ローカル状態（Local State）
- **定義**: 単一のコンポーネント内でのみ使用される状態
- **例**: フォームの入力値、モーダルの開閉状態
- **管理方法**: `useState`, `useReducer`

#### 2. グローバル状態（Global State）
- **定義**: アプリケーション全体で共有される状態
- **例**: ユーザー認証情報、テーマ設定、カート情報
- **管理方法**: Context API, Redux, Zustand, Jotai, Recoil

#### 3. サーバー状態（Server State）
- **定義**: サーバーから取得し、同期が必要な状態
- **例**: APIから取得したユーザーリスト、商品情報
- **管理方法**: TanStack Query (React Query), SWR

### 状態管理の3つの派閥

```
┌─────────────────────────────────────────────────────────────┐
│ ① 巨大倉庫派（Flux Architecture）                           │
│    Redux, Zustand                                           │
│    特徴: 一箇所で全てを集中管理                              │
│    合言葉: 「データは一箇所で集中管理！」                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ② 分散粒子派（Atomic State Management）                     │
│    Jotai, Recoil                                            │
│    特徴: 小さな単位（Atom）で分散管理                        │
│    合言葉: 「必要なデータを必要な場所へ！」                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ③ 放送局派（Dependency Injection）                          │
│    Context API                                              │
│    特徴: 親から子孫へデータを一斉配信                         │
│    合言葉: 「上から下へ一斉配信！」                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ④ サーバー出張所（Server State Management）                 │
│    TanStack Query, SWR                                      │
│    特徴: サーバーとの通信とキャッシュを専門管理               │
│    合言葉: 「通信のことは全部やるよ！」                       │
└─────────────────────────────────────────────────────────────┘
```

---

## React標準フック

React標準で提供されるフックは、状態管理の基礎となる機能です。ライブラリを使わずに、これらだけで多くのアプリケーションを構築できます。

### 1. useState

#### 概要

最も基本的な状態管理フックです。コンポーネント内で状態を保持し、更新する機能を提供します。

#### 動作原理

- コンポーネントの再レンダリング間で値を保持
- 状態更新時に自動的にコンポーネントを再レンダリング
- 状態は非同期で更新される

#### 基本的な使い方

```typescript
import { useState } from 'react';

function Counter() {
  // [現在の値, 更新関数] = useState(初期値)
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>カウント: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={() => setCount(count - 1)}>-1</button>
      <button onClick={() => setCount(0)}>リセット</button>
    </div>
  );
}
```

#### 関数的更新

前の状態に基づいて更新する場合は、関数を渡すべきです：

```typescript
function Counter() {
  const [count, setCount] = useState(0);

  // ❌ 悪い例: 複数回呼ばれると期待通りに動かない
  const incrementBad = () => {
    setCount(count + 1);
    setCount(count + 1); // 2回呼んでも +1 にしかならない
  };

  // ✅ 良い例: 前の状態を受け取る関数を使う
  const incrementGood = () => {
    setCount(prev => prev + 1);
    setCount(prev => prev + 1); // 正しく +2 になる
  };

  return (
    <div>
      <p>カウント: {count}</p>
      <button onClick={incrementGood}>+2</button>
    </div>
  );
}
```

#### 複雑な状態の管理

オブジェクトや配列を状態として管理する場合：

```typescript
interface CounterState {
  count: number;
  step: number;
  history: number[];
}

function AdvancedCounter() {
  const [state, setState] = useState<CounterState>({
    count: 0,
    step: 1,
    history: [0],
  });

  const increment = () => {
    setState(prev => ({
      ...prev,
      count: prev.count + prev.step,
      history: [...prev.history, prev.count + prev.step],
    }));
  };

  const changeStep = (newStep: number) => {
    setState(prev => ({ ...prev, step: newStep }));
  };

  return (
    <div>
      <p>カウント: {state.count}</p>
      <p>ステップ: {state.step}</p>
      <button onClick={increment}>+{state.step}</button>
      <button onClick={() => changeStep(5)}>ステップを5に変更</button>
      <div>履歴: {state.history.join(', ')}</div>
    </div>
  );
}
```

#### ユースケース

✅ **適している場合:**
- 単一のコンポーネント内で完結する状態
- フォームの入力値
- UI要素の開閉状態（モーダル、ドロップダウンなど）
- シンプルな値の管理

❌ **不適切な場合:**
- 複数のコンポーネント間で共有が必要な状態
- 複雑なビジネスロジックを伴う状態更新
- 深くネストしたコンポーネント間での状態共有

#### 長所と短所

**長所:**
- シンプルで学習コストが低い
- React標準機能なので追加依存なし
- 小規模な状態管理には最適

**短所:**
- Prop Drilling（プロップスのバケツリレー）が発生する
- 状態が増えると管理が煩雑になる
- 状態更新ロジックがコンポーネント内に散在しがち

---

### 2. useEffect

#### 概要

副作用（Side Effect）を扱うためのフックです。データ取得、購読の設定、DOM操作など、レンダリング外の処理を実行します。

#### 動作原理

- コンポーネントのレンダリング後に実行される
- 依存配列に指定した値が変更されたときに再実行
- クリーンアップ関数を返すことでリソースの解放が可能

#### 基本的な使い方

```typescript
import { useState, useEffect } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  // マウント時とcountが変更されるたびに実行
  useEffect(() => {
    document.title = `カウント: ${count}`;
  }, [count]); // 依存配列

  return (
    <div>
      <p>カウント: {count}</p>
      <button onClick={() => setCount(prev => prev + 1)}>+1</button>
    </div>
  );
}
```

#### データ取得の例

```typescript
interface User {
  id: number;
  name: string;
}

function UserCounter() {
  const [count, setCount] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // クリーンアップ用のフラグ
    let isCancelled = false;

    const fetchUser = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`/api/users/${count}`);
        const data = await response.json();

        if (!isCancelled) {
          setUser(data);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err as Error);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    if (count > 0) {
      fetchUser();
    }

    // クリーンアップ関数
    return () => {
      isCancelled = true;
    };
  }, [count]);

  return (
    <div>
      <p>ユーザーID: {count}</p>
      <button onClick={() => setCount(prev => prev + 1)}>次のユーザー</button>

      {isLoading && <p>読み込み中...</p>}
      {error && <p>エラー: {error.message}</p>}
      {user && <p>ユーザー名: {user.name}</p>}
    </div>
  );
}
```

#### 依存配列のパターン

```typescript
function EffectPatterns() {
  const [count, setCount] = useState(0);

  // パターン1: マウント時のみ実行（空の依存配列）
  useEffect(() => {
    console.log('コンポーネントがマウントされました');
    return () => {
      console.log('コンポーネントがアンマウントされます');
    };
  }, []);

  // パターン2: 特定の値が変わったときのみ実行
  useEffect(() => {
    console.log(`カウントが ${count} に変わりました`);
  }, [count]);

  // パターン3: レンダリングごとに毎回実行（非推奨）
  useEffect(() => {
    console.log('レンダリングされました');
  }); // 依存配列なし

  return <button onClick={() => setCount(prev => prev + 1)}>+1</button>;
}
```

#### よくある落とし穴

```typescript
function ProblematicCounter() {
  const [count, setCount] = useState(0);

  // ❌ 無限ループを引き起こす
  useEffect(() => {
    setCount(count + 1); // countが変わる → useEffectが再実行 → 無限ループ
  }, [count]);

  // ❌ 依存配列の指定漏れ
  const multiplier = 2;
  useEffect(() => {
    console.log(count * multiplier); // multiplierを依存配列に入れるべき
  }, [count]); // ESLintが警告を出す

  return <div>{count}</div>;
}
```

#### ユースケース

✅ **適している場合:**
- データ取得（fetch, axios）
- イベントリスナーの登録/解除
- タイマーの設定/クリア
- ブラウザAPIの操作（localStorage, document.titleなど）
- 外部ライブラリの初期化

❌ **不適切な場合:**
- イベントハンドラ内の処理（直接関数で書くべき）
- レンダリング中に計算できる値の導出
- 状態の初期化（useStateの引数で行うべき）

#### 長所と短所

**長所:**
- 副作用を宣言的に記述できる
- クリーンアップが自動化される
- コンポーネントのライフサイクルを統一的に扱える

**短所:**
- 依存配列の管理が複雑
- 非同期処理の制御が煩雑（競合状態など）
- デバッグが難しい場合がある
- データ取得に使うとボイラープレートが多い

---

### 3. useContext

#### 概要

コンポーネントツリーを通じてデータを共有するためのフックです。Prop Drilling（プロップスのバケツリレー）を避け、深い階層のコンポーネントに直接データを渡せます。

#### 動作原理

- Context（データの放送局）を作成
- Provider（配信元）でデータを提供
- useContext（受信機）でデータを受け取る
- Providerの値が変わると、そのContextを使う全てのコンポーネントが再レンダリング

#### 基本的な使い方

```typescript
import { createContext, useContext, useState, ReactNode } from 'react';

// 1. Contextの作成
interface CounterContextType {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

const CounterContext = createContext<CounterContextType | undefined>(undefined);

// 2. Providerコンポーネントの作成
interface CounterProviderProps {
  children: ReactNode;
}

function CounterProvider({ children }: CounterProviderProps) {
  const [count, setCount] = useState(0);

  const increment = () => setCount(prev => prev + 1);
  const decrement = () => setCount(prev => prev - 1);
  const reset = () => setCount(0);

  const value = { count, increment, decrement, reset };

  return (
    <CounterContext.Provider value={value}>
      {children}
    </CounterContext.Provider>
  );
}

// 3. カスタムフックの作成（オプションだが推奨）
function useCounter() {
  const context = useContext(CounterContext);
  if (context === undefined) {
    throw new Error('useCounter must be used within a CounterProvider');
  }
  return context;
}

// 4. 使用例
function CounterDisplay() {
  const { count } = useCounter();
  return <p>カウント: {count}</p>;
}

function CounterButtons() {
  const { increment, decrement, reset } = useCounter();
  return (
    <div>
      <button onClick={increment}>+1</button>
      <button onClick={decrement}>-1</button>
      <button onClick={reset}>リセット</button>
    </div>
  );
}

function App() {
  return (
    <CounterProvider>
      <div>
        <h1>カウンターアプリ</h1>
        <CounterDisplay />
        <CounterButtons />
      </div>
    </CounterProvider>
  );
}
```

#### 複数のContextの組み合わせ

```typescript
import { createContext, useContext, useState, ReactNode } from 'react';

// テーマContext
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}

// カウンターContext（上記と同じ）
// ...

// アプリケーション
function ThemedCounter() {
  const { count, increment } = useCounter();
  const { theme, toggleTheme } = useTheme();

  return (
    <div style={{ background: theme === 'dark' ? '#333' : '#fff' }}>
      <p>カウント: {count}</p>
      <button onClick={increment}>+1</button>
      <button onClick={toggleTheme}>テーマ切替</button>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <CounterProvider>
        <ThemedCounter />
      </CounterProvider>
    </ThemeProvider>
  );
}
```

#### パフォーマンス最適化

Context の値が変わると、それを使う全てのコンポーネントが再レンダリングされます。これを最適化する方法：

```typescript
import { createContext, useContext, useState, useMemo, ReactNode, memo } from 'react';

interface CounterContextType {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

const CounterContext = createContext<CounterContextType | undefined>(undefined);

function CounterProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);

  // ✅ 関数をメモ化して、不要な再レンダリングを防ぐ
  const value = useMemo<CounterContextType>(() => ({
    count,
    increment: () => setCount(prev => prev + 1),
    decrement: () => setCount(prev => prev - 1),
    reset: () => setCount(0),
  }), [count]);

  return (
    <CounterContext.Provider value={value}>
      {children}
    </CounterContext.Provider>
  );
}

// ✅ memo で最適化（countが変わらなければ再レンダリングされない）
const ExpensiveComponent = memo(function ExpensiveComponent() {
  console.log('ExpensiveComponent がレンダリングされました');
  return <div>重い計算処理のコンポーネント</div>;
});
```

#### Context分割パターン

状態と更新関数を分けることで、更新関数だけを使うコンポーネントの不要な再レンダリングを防げます：

```typescript
import { createContext, useContext, useState, ReactNode } from 'react';

// 状態用Context
const CounterStateContext = createContext<number | undefined>(undefined);
// 更新関数用Context
const CounterDispatchContext = createContext<{
  increment: () => void;
  decrement: () => void;
  reset: () => void;
} | undefined>(undefined);

function CounterProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);

  const dispatch = {
    increment: () => setCount(prev => prev + 1),
    decrement: () => setCount(prev => prev - 1),
    reset: () => setCount(0),
  };

  return (
    <CounterStateContext.Provider value={count}>
      <CounterDispatchContext.Provider value={dispatch}>
        {children}
      </CounterDispatchContext.Provider>
    </CounterStateContext.Provider>
  );
}

function useCounterState() {
  const context = useContext(CounterStateContext);
  if (context === undefined) {
    throw new Error('useCounterState must be used within CounterProvider');
  }
  return context;
}

function useCounterDispatch() {
  const context = useContext(CounterDispatchContext);
  if (context === undefined) {
    throw new Error('useCounterDispatch must be used within CounterProvider');
  }
  return context;
}

// 表示だけするコンポーネント（countが変わると再レンダリング）
function CounterDisplay() {
  const count = useCounterState();
  return <p>カウント: {count}</p>;
}

// ボタンだけのコンポーネント（countが変わっても再レンダリングされない！）
function CounterButtons() {
  const { increment, decrement, reset } = useCounterDispatch();
  console.log('CounterButtons rendered'); // countが変わっても表示されない

  return (
    <div>
      <button onClick={increment}>+1</button>
      <button onClick={decrement}>-1</button>
      <button onClick={reset}>リセット</button>
    </div>
  );
}
```

#### ユースケース

✅ **適している場合:**
- テーマ設定（light/dark mode）
- 言語設定（i18n）
- ユーザー認証情報（更新頻度が低い）
- 設定値の共有
- 3階層以上のProp Drillingを避けたい場合

❌ **不適切な場合:**
- 頻繁に更新される状態（パフォーマンス問題）
- 複雑なビジネスロジックを伴う状態管理
- 大規模アプリケーションの全体的な状態管理

#### 長所と短所

**長所:**
- React標準機能で追加依存なし
- Prop Drillingを解消
- シンプルなAPI
- TypeScriptとの相性が良い

**短所:**
- 再レンダリングの最適化が難しい
- Contextの値が変わると全ての購読者が再レンダリング
- 複数のContextを使うとProviderのネストが深くなる
- デバッグツールがない

---

### 4. useReducer

#### 概要

Reduxライクな方法で複雑な状態ロジックを管理するフックです。状態更新のロジックをコンポーネントから分離し、テストしやすくします。

#### 動作原理

- `reducer` 関数が状態の更新ルールを定義
- `dispatch` 関数でアクションを送信
- reducerがアクションに応じて新しい状態を返す
- useStateより予測可能で、複雑なロジックに適している

#### 基本的な使い方

```typescript
import { useReducer } from 'react';

// 1. 状態の型定義
interface CounterState {
  count: number;
  step: number;
}

// 2. アクションの型定義
type CounterAction =
  | { type: 'INCREMENT' }
  | { type: 'DECREMENT' }
  | { type: 'RESET' }
  | { type: 'SET_STEP'; payload: number }
  | { type: 'INCREMENT_BY_STEP' };

// 3. Reducer関数の定義
function counterReducer(state: CounterState, action: CounterAction): CounterState {
  switch (action.type) {
    case 'INCREMENT':
      return { ...state, count: state.count + 1 };
    case 'DECREMENT':
      return { ...state, count: state.count - 1 };
    case 'RESET':
      return { ...state, count: 0 };
    case 'SET_STEP':
      return { ...state, step: action.payload };
    case 'INCREMENT_BY_STEP':
      return { ...state, count: state.count + state.step };
    default:
      return state;
  }
}

// 4. コンポーネントでの使用
function Counter() {
  const initialState: CounterState = { count: 0, step: 1 };
  const [state, dispatch] = useReducer(counterReducer, initialState);

  return (
    <div>
      <p>カウント: {state.count}</p>
      <p>ステップ: {state.step}</p>

      <button onClick={() => dispatch({ type: 'INCREMENT' })}>+1</button>
      <button onClick={() => dispatch({ type: 'DECREMENT' })}>-1</button>
      <button onClick={() => dispatch({ type: 'INCREMENT_BY_STEP' })}>
        +{state.step}
      </button>
      <button onClick={() => dispatch({ type: 'RESET' })}>リセット</button>

      <div>
        <label>
          ステップ:
          <input
            type="number"
            value={state.step}
            onChange={(e) =>
              dispatch({ type: 'SET_STEP', payload: Number(e.target.value) })
            }
          />
        </label>
      </div>
    </div>
  );
}
```

#### useReducer + useContext で状態管理

useReducerとuseContextを組み合わせることで、Reduxのような状態管理が可能です：

```typescript
import { createContext, useContext, useReducer, ReactNode } from 'react';

// 状態とアクションの型定義
interface CounterState {
  count: number;
  history: number[];
}

type CounterAction =
  | { type: 'INCREMENT' }
  | { type: 'DECREMENT' }
  | { type: 'RESET' }
  | { type: 'UNDO' };

// Reducer
function counterReducer(state: CounterState, action: CounterAction): CounterState {
  switch (action.type) {
    case 'INCREMENT': {
      const newCount = state.count + 1;
      return {
        count: newCount,
        history: [...state.history, newCount],
      };
    }
    case 'DECREMENT': {
      const newCount = state.count - 1;
      return {
        count: newCount,
        history: [...state.history, newCount],
      };
    }
    case 'RESET':
      return {
        count: 0,
        history: [0],
      };
    case 'UNDO': {
      if (state.history.length <= 1) return state;
      const newHistory = state.history.slice(0, -1);
      return {
        count: newHistory[newHistory.length - 1],
        history: newHistory,
      };
    }
    default:
      return state;
  }
}

// Context
interface CounterContextType {
  state: CounterState;
  dispatch: React.Dispatch<CounterAction>;
}

const CounterContext = createContext<CounterContextType | undefined>(undefined);

// Provider
function CounterProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(counterReducer, {
    count: 0,
    history: [0],
  });

  return (
    <CounterContext.Provider value={{ state, dispatch }}>
      {children}
    </CounterContext.Provider>
  );
}

// カスタムフック
function useCounter() {
  const context = useContext(CounterContext);
  if (!context) {
    throw new Error('useCounter must be used within CounterProvider');
  }
  return context;
}

// コンポーネント
function CounterDisplay() {
  const { state } = useCounter();
  return (
    <div>
      <p>カウント: {state.count}</p>
      <p>履歴: {state.history.join(' → ')}</p>
    </div>
  );
}

function CounterControls() {
  const { dispatch } = useCounter();
  return (
    <div>
      <button onClick={() => dispatch({ type: 'INCREMENT' })}>+1</button>
      <button onClick={() => dispatch({ type: 'DECREMENT' })}>-1</button>
      <button onClick={() => dispatch({ type: 'RESET' })}>リセット</button>
      <button onClick={() => dispatch({ type: 'UNDO' })}>元に戻す</button>
    </div>
  );
}

function App() {
  return (
    <CounterProvider>
      <CounterDisplay />
      <CounterControls />
    </CounterProvider>
  );
}
```

#### 複雑な状態管理の例

```typescript
import { useReducer } from 'react';

// より複雑な状態
interface AppState {
  counter: {
    value: number;
    step: number;
  };
  ui: {
    isLoading: boolean;
    error: string | null;
  };
  user: {
    name: string;
    role: 'admin' | 'user' | 'guest';
  };
}

type AppAction =
  | { type: 'counter/increment' }
  | { type: 'counter/setStep'; payload: number }
  | { type: 'ui/setLoading'; payload: boolean }
  | { type: 'ui/setError'; payload: string | null }
  | { type: 'user/setName'; payload: string }
  | { type: 'user/setRole'; payload: 'admin' | 'user' | 'guest' };

const initialState: AppState = {
  counter: { value: 0, step: 1 },
  ui: { isLoading: false, error: null },
  user: { name: 'Guest', role: 'guest' },
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'counter/increment':
      return {
        ...state,
        counter: {
          ...state.counter,
          value: state.counter.value + state.counter.step,
        },
      };
    case 'counter/setStep':
      return {
        ...state,
        counter: { ...state.counter, step: action.payload },
      };
    case 'ui/setLoading':
      return {
        ...state,
        ui: { ...state.ui, isLoading: action.payload },
      };
    case 'ui/setError':
      return {
        ...state,
        ui: { ...state.ui, error: action.payload },
      };
    case 'user/setName':
      return {
        ...state,
        user: { ...state.user, name: action.payload },
      };
    case 'user/setRole':
      return {
        ...state,
        user: { ...state.user, role: action.payload },
      };
    default:
      return state;
  }
}

function App() {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <div>
      <h2>カウンター: {state.counter.value}</h2>
      <button onClick={() => dispatch({ type: 'counter/increment' })}>
        +{state.counter.step}
      </button>

      {state.ui.isLoading && <p>読み込み中...</p>}
      {state.ui.error && <p>エラー: {state.ui.error}</p>}

      <p>ようこそ、{state.user.name}さん（{state.user.role}）</p>
    </div>
  );
}
```

#### useStateとuseReducerの使い分け

```typescript
// useState が適している
function SimpleCounter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}

// useReducer が適している
function ComplexCounter() {
  const [state, dispatch] = useReducer(counterReducer, initialState);
  // 複数の状態を持ち、複雑な更新ロジックがある場合
  return (
    <div>
      <button onClick={() => dispatch({ type: 'INCREMENT' })}>+</button>
      <button onClick={() => dispatch({ type: 'DECREMENT' })}>-</button>
      <button onClick={() => dispatch({ type: 'RESET' })}>Reset</button>
    </div>
  );
}
```

#### ユースケース

✅ **適している場合:**
- 複数の状態値が相互に関連している
- 次の状態が前の状態に依存する複雑なロジック
- 状態更新ロジックをコンポーネントから分離したい
- テストしやすいコードを書きたい
- useStateでは管理しきれなくなった場合

❌ **不適切な場合:**
- シンプルな状態（useStateで十分）
- 状態が独立している場合
- 過度に小さな状態（オーバーエンジニアリング）

#### 長所と短所

**長所:**
- 状態更新ロジックがコンポーネントから分離され、テストしやすい
- 複雑な状態遷移を予測可能な形で管理できる
- TypeScriptと組み合わせると型安全性が高い
- Redux的なパターンを標準機能で実現できる

**短所:**
- useStateより記述量が多い
- 学習コストがやや高い
- 過剰に使うとコードが冗長になる
- Redux DevToolsのようなデバッグツールがない

---

### React標準フックのまとめ

以下の表で、4つのフックの特徴を比較します：

| フック | 主な用途 | 学習コスト | 適用範囲 | パフォーマンス |
|--------|---------|-----------|---------|---------------|
| **useState** | シンプルな状態管理 | ★☆☆☆☆ | 単一コンポーネント | ⚡⚡⚡⚡⚡ |
| **useEffect** | 副作用の実行 | ★★★☆☆ | 単一コンポーネント | ⚡⚡⚡☆☆ |
| **useContext** | コンポーネント間でのデータ共有 | ★★☆☆☆ | コンポーネントツリー | ⚡⚡☆☆☆ |
| **useReducer** | 複雑な状態ロジック | ★★★☆☆ | 単一コンポーネント | ⚡⚡⚡⚡☆ |

#### 選択フローチャート

```
状態管理が必要 → どのフックを使う？
│
├─ サーバーからデータを取得する？
│  └─ YES → useEffect（または TanStack Query を検討）
│
├─ 複数のコンポーネントで共有する？
│  ├─ YES → useContext（更新頻度が低い場合）
│  │       → 状態管理ライブラリを検討（更新頻度が高い場合）
│  └─ NO → 次へ
│
├─ 状態更新ロジックが複雑？
│  ├─ YES → useReducer
│  └─ NO → useState
```

---

## 状態管理ライブラリ

React標準のフックで対応できない場合や、より高度な機能が必要な場合は、状態管理ライブラリを使用します。

### 1. Zustand（ズスタンド）

#### 概要

**「Reduxの面倒くささを取り除いた、現代の覇者」**

Zustandは、シンプルで軽量な状態管理ライブラリです。Reduxのような一箇所での集中管理というアーキテクチャを維持しながら、ボイラープレートを大幅に削減しています。

**公式サイト:** https://github.com/pmndrs/zustand

#### 特徴

- **軽量**: ライブラリサイズが非常に小さい（1KB未満）
- **シンプル**: Providerが不要で、Hooksのように使える
- **TypeScript**: 完全な型サポート
- **ミドルウェア**: persist（永続化）、devtools（デバッグ）などの拡張機能
- **学習コスト**: 低い（Reduxより圧倒的に簡単）

#### 動作原理

- `create` 関数でストアを作成
- ストアは状態と更新関数を含む
- コンポーネントから直接ストアにアクセス
- セレクター関数で必要な部分だけ購読（パフォーマンス最適化）

#### インストール

```bash
npm install zustand
# または
yarn add zustand
# または
pnpm add zustand
```

#### 基本的な使い方

```typescript
import { create } from 'zustand';

// 1. ストアの型定義
interface CounterStore {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  incrementBy: (value: number) => void;
}

// 2. ストアの作成
const useCounterStore = create<CounterStore>((set) => ({
  // 初期状態
  count: 0,

  // アクション（状態を更新する関数）
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
  incrementBy: (value) => set((state) => ({ count: state.count + value })),
}));

// 3. コンポーネントでの使用
function Counter() {
  // ストア全体を取得
  const { count, increment, decrement, reset } = useCounterStore();

  return (
    <div>
      <p>カウント: {count}</p>
      <button onClick={increment}>+1</button>
      <button onClick={decrement}>-1</button>
      <button onClick={reset}>リセット</button>
    </div>
  );
}
```

#### セレクターによる最適化

必要な状態だけを購読することで、不要な再レンダリングを防げます：

```typescript
function CounterDisplay() {
  // countだけを取得（countが変わった時だけ再レンダリング）
  const count = useCounterStore((state) => state.count);

  console.log('CounterDisplay rendered');
  return <p>カウント: {count}</p>;
}

function CounterButtons() {
  // アクションだけを取得（再レンダリングされない！）
  const increment = useCounterStore((state) => state.increment);
  const decrement = useCounterStore((state) => state.decrement);
  const reset = useCounterStore((state) => state.reset);

  console.log('CounterButtons rendered'); // 初回のみ表示される
  return (
    <div>
      <button onClick={increment}>+1</button>
      <button onClick={decrement}>-1</button>
      <button onClick={reset}>リセット</button>
    </div>
  );
}
```

#### 複雑な状態の管理

```typescript
import { create } from 'zustand';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

interface TodoStore {
  todos: Todo[];
  filter: 'all' | 'active' | 'completed';

  addTodo: (text: string) => void;
  toggleTodo: (id: number) => void;
  deleteTodo: (id: number) => void;
  setFilter: (filter: 'all' | 'active' | 'completed') => void;

  // 計算値（Computed values）
  filteredTodos: () => Todo[];
  activeCount: () => number;
}

const useTodoStore = create<TodoStore>((set, get) => ({
  todos: [],
  filter: 'all',

  addTodo: (text) =>
    set((state) => ({
      todos: [
        ...state.todos,
        { id: Date.now(), text, completed: false },
      ],
    })),

  toggleTodo: (id) =>
    set((state) => ({
      todos: state.todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ),
    })),

  deleteTodo: (id) =>
    set((state) => ({
      todos: state.todos.filter((todo) => todo.id !== id),
    })),

  setFilter: (filter) => set({ filter }),

  // get()で現在の状態を取得できる
  filteredTodos: () => {
    const { todos, filter } = get();
    switch (filter) {
      case 'active':
        return todos.filter((todo) => !todo.completed);
      case 'completed':
        return todos.filter((todo) => todo.completed);
      default:
        return todos;
    }
  },

  activeCount: () => {
    const { todos } = get();
    return todos.filter((todo) => !todo.completed).length;
  },
}));

// 使用例
function TodoApp() {
  const addTodo = useTodoStore((state) => state.addTodo);
  const filteredTodos = useTodoStore((state) => state.filteredTodos());
  const toggleTodo = useTodoStore((state) => state.toggleTodo);
  const deleteTodo = useTodoStore((state) => state.deleteTodo);

  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      addTodo(input);
      setInput('');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="新しいタスク"
        />
        <button type="submit">追加</button>
      </form>

      <ul>
        {filteredTodos.map((todo) => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
              {todo.text}
            </span>
            <button onClick={() => deleteTodo(todo.id)}>削除</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

#### ミドルウェア: Persist（永続化）

状態をlocalStorageやsessionStorageに自動保存できます：

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface CounterStore {
  count: number;
  increment: () => void;
  reset: () => void;
}

const useCounterStore = create<CounterStore>()(
  persist(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
      reset: () => set({ count: 0 }),
    }),
    {
      name: 'counter-storage', // localStorageのキー名
      storage: createJSONStorage(() => localStorage), // デフォルトはlocalStorage
    }
  )
);

// リロードしてもカウントが保持される！
function Counter() {
  const { count, increment, reset } = useCounterStore();
  return (
    <div>
      <p>カウント: {count}</p>
      <button onClick={increment}>+1</button>
      <button onClick={reset}>リセット</button>
    </div>
  );
}
```

#### ミドルウェア: DevTools

Redux DevToolsで状態を可視化できます：

```typescript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface CounterStore {
  count: number;
  increment: () => void;
  decrement: () => void;
}

const useCounterStore = create<CounterStore>()(
  devtools(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 }), undefined, 'increment'),
      decrement: () => set((state) => ({ count: state.count - 1 }), undefined, 'decrement'),
    }),
    {
      name: 'CounterStore', // DevToolsに表示される名前
    }
  )
);
```

#### Immer ミドルウェア

イミュータブルな更新をより簡単に書けます：

```typescript
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface User {
  name: string;
  age: number;
  address: {
    city: string;
    zipCode: string;
  };
}

interface UserStore {
  user: User;
  updateCity: (city: string) => void;
  incrementAge: () => void;
}

const useUserStore = create<UserStore>()(
  immer((set) => ({
    user: {
      name: 'John',
      age: 30,
      address: {
        city: 'Tokyo',
        zipCode: '100-0001',
      },
    },

    // Immerを使うと、ミューテーション風に書ける
    updateCity: (city) =>
      set((state) => {
        state.user.address.city = city; // 直接変更できる！
      }),

    incrementAge: () =>
      set((state) => {
        state.user.age += 1; // 直接変更できる！
      }),
  }))
);
```

#### 複数ミドルウェアの組み合わせ

```typescript
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface CounterStore {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

const useCounterStore = create<CounterStore>()(
  devtools(
    persist(
      immer((set) => ({
        count: 0,
        increment: () => set((state) => { state.count += 1; }),
        decrement: () => set((state) => { state.count -= 1; }),
        reset: () => set((state) => { state.count = 0; }),
      })),
      { name: 'counter-storage' }
    ),
    { name: 'CounterStore' }
  )
);
```

#### ストアの分割（Slice Pattern）

大規模アプリケーションでは、ストアを機能ごとに分割すると管理しやすくなります：

```typescript
import { create } from 'zustand';

// カウンタースライス
interface CounterSlice {
  count: number;
  increment: () => void;
  decrement: () => void;
}

const createCounterSlice = (set: any): CounterSlice => ({
  count: 0,
  increment: () => set((state: any) => ({ count: state.count + 1 })),
  decrement: () => set((state: any) => ({ count: state.count - 1 })),
});

// ユーザースライス
interface UserSlice {
  user: { name: string; email: string } | null;
  setUser: (user: { name: string; email: string }) => void;
  clearUser: () => void;
}

const createUserSlice = (set: any): UserSlice => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
});

// 統合
type StoreState = CounterSlice & UserSlice;

const useStore = create<StoreState>()((...a) => ({
  ...createCounterSlice(...a),
  ...createUserSlice(...a),
}));

// 使用例
function App() {
  const count = useStore((state) => state.count);
  const increment = useStore((state) => state.increment);
  const user = useStore((state) => state.user);
  const setUser = useStore((state) => state.setUser);

  return (
    <div>
      <p>カウント: {count}</p>
      <button onClick={increment}>+1</button>

      {user && <p>ユーザー: {user.name}</p>}
      <button onClick={() => setUser({ name: 'Alice', email: 'alice@example.com' })}>
        ログイン
      </button>
    </div>
  );
}
```

#### React外での使用

Zustandのストアはフック以外からもアクセスできます：

```typescript
import { create } from 'zustand';

interface CounterStore {
  count: number;
  increment: () => void;
}

const useCounterStore = create<CounterStore>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));

// React外からストアにアクセス
const incrementOutsideReact = () => {
  useCounterStore.getState().increment();
};

// 状態の取得
console.log(useCounterStore.getState().count);

// 状態の変更を購読
const unsubscribe = useCounterStore.subscribe(
  (state) => console.log('状態が変わりました:', state.count)
);

// イベントリスナーなどから呼び出せる
document.getElementById('btn')?.addEventListener('click', incrementOutsideReact);

// 購読の解除
unsubscribe();
```

#### ユースケース

✅ **適している場合:**
- 中〜大規模アプリケーション
- Reduxは重すぎると感じる場合
- シンプルでモダンな状態管理が欲しい
- TypeScriptを使っている
- パフォーマンス最適化が重要
- 複数のコンポーネントで状態を共有したい

❌ **不適切な場合:**
- 非常に小規模なアプリ（useState で十分）
- サーバー状態の管理（TanStack Query を使うべき）
- 既にReduxでうまく動いている大規模プロジェクト

#### 長所と短所

**長所:**
- 非常にシンプルで学習コストが低い
- ボイラープレートが最小限
- Providerが不要
- TypeScriptとの相性が抜群
- パフォーマンスが優れている
- ミドルウェアで機能拡張が簡単
- ライブラリサイズが小さい
- React外でも使える

**短所:**
- Reduxほど機能が豊富ではない
- エコシステムがReduxより小さい
- 非常に大規模なアプリでは構造化が課題になる可能性
- タイムトラベルデバッグはReduxほど強力ではない

#### Redux との比較

| 項目 | Zustand | Redux Toolkit |
|-----|---------|---------------|
| ボイラープレート | ⚡⚡⚡⚡⚡ 最小限 | ⚡⚡⚡☆☆ 中程度 |
| 学習コスト | ⚡⚡⚡⚡⚡ 低い | ⚡⚡☆☆☆ やや高い |
| Providerの必要性 | ⚡⚡⚡⚡⚡ 不要 | ⚡⚡☆☆☆ 必要 |
| TypeScript対応 | ⚡⚡⚡⚡⚡ 優秀 | ⚡⚡⚡⚡☆ 優秀 |
| エコシステム | ⚡⚡⚡☆☆ 中 | ⚡⚡⚡⚡⚡ 非常に豊富 |
| デバッグツール | ⚡⚡⚡⚡☆ DevTools対応 | ⚡⚡⚡⚡⚡ 非常に強力 |
| 適用規模 | 小〜大 | 中〜超大規模 |

---

### 2. Jotai（ジョータイ）

#### 概要

**「useState の延長線上にある、最小限の状態管理」**

Jotaiは、Atomic（原子的）な状態管理の哲学に基づいたライブラリです。状態を小さな単位（Atom）に分割し、必要な場所で必要な分だけ使用します。

**公式サイト:** https://jotai.org/

#### 特徴

- **Atomic**: 状態を最小単位（Atom）で管理
- **シンプル**: useStateに近い API
- **軽量**: 非常に小さいバンドルサイズ（2.9KB）
- **TypeScript**: 型推論が優れている
- **React Suspense**: 標準でサポート
- **Providerレス**: グローバルなAtomはProviderなしで動作

#### 動作原理

- `atom` 関数で状態の単位を定義
- `useAtom` フックで状態を読み書き
- `useAtomValue` で読み取り専用
- `useSetAtom` で書き込み専用
- Atomから派生したAtom（Derived Atom）を作成可能

#### インストール

```bash
npm install jotai
# または
yarn add jotai
# または
pnpm add jotai
```

#### 基本的な使い方

```typescript
import { atom, useAtom } from 'jotai';

// 1. Atomの定義（ファイルのトップレベルで定義）
const countAtom = atom(0);

// 2. コンポーネントでの使用
function Counter() {
  // useStateとほぼ同じ API
  const [count, setCount] = useAtom(countAtom);

  return (
    <div>
      <p>カウント: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={() => setCount(prev => prev - 1)}>-1</button>
      <button onClick={() => setCount(0)}>リセット</button>
    </div>
  );
}

// 3. 別のコンポーネントでも同じAtomを使える
function CounterDisplay() {
  // 読み取り専用で使う
  const [count] = useAtom(countAtom);
  // または
  // const count = useAtomValue(countAtom);

  return <p>現在のカウント: {count}</p>;
}
```

#### 読み取り専用 / 書き込み専用

```typescript
import { atom, useAtomValue, useSetAtom } from 'jotai';

const countAtom = atom(0);

// 読み取り専用（このコンポーネントは値が変わると再レンダリング）
function CounterDisplay() {
  const count = useAtomValue(countAtom);
  return <p>カウント: {count}</p>;
}

// 書き込み専用（このコンポーネントは再レンダリングされない）
function CounterButtons() {
  const setCount = useSetAtom(countAtom);

  console.log('CounterButtons rendered');

  return (
    <div>
      <button onClick={() => setCount(prev => prev + 1)}>+1</button>
      <button onClick={() => setCount(prev => prev - 1)}>-1</button>
      <button onClick={() => setCount(0)}>リセット</button>
    </div>
  );
}
```

#### 派生Atom（Derived Atom）

他のAtomから計算される値を定義できます：

```typescript
import { atom, useAtomValue } from 'jotai';

// 基本のAtom
const countAtom = atom(0);

// 読み取り専用の派生Atom
const doubleCountAtom = atom((get) => get(countAtom) * 2);

// 三つ組を返すAtom
const statusAtom = atom((get) => {
  const count = get(countAtom);
  if (count === 0) return 'ゼロ';
  if (count > 0) return 'プラス';
  return 'マイナス';
});

function Counter() {
  const [count, setCount] = useAtom(countAtom);
  const doubleCount = useAtomValue(doubleCountAtom);
  const status = useAtomValue(statusAtom);

  return (
    <div>
      <p>カウント: {count}</p>
      <p>2倍: {doubleCount}</p>
      <p>状態: {status}</p>
      <button onClick={() => setCount(prev => prev + 1)}>+1</button>
    </div>
  );
}
```

#### 書き込み可能な派生Atom

読み取りと書き込みの両方をカスタマイズできます：

```typescript
import { atom, useAtom } from 'jotai';

const celsiusAtom = atom(0);

// 華氏と摂氏を相互変換するAtom
const fahrenheitAtom = atom(
  // 読み取り
  (get) => (get(celsiusAtom) * 9) / 5 + 32,
  // 書き込み
  (get, set, newValue: number) => {
    set(celsiusAtom, ((newValue - 32) * 5) / 9);
  }
);

function TemperatureConverter() {
  const [celsius, setCelsius] = useAtom(celsiusAtom);
  const [fahrenheit, setFahrenheit] = useAtom(fahrenheitAtom);

  return (
    <div>
      <label>
        摂氏:
        <input
          type="number"
          value={celsius}
          onChange={(e) => setCelsius(Number(e.target.value))}
        />
      </label>
      <label>
        華氏:
        <input
          type="number"
          value={fahrenheit}
          onChange={(e) => setFahrenheit(Number(e.target.value))}
        />
      </label>
    </div>
  );
}
```

#### 複雑な状態管理（Todo リスト）

```typescript
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';

// 型定義
interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

type Filter = 'all' | 'active' | 'completed';

// 基本のAtoms
const todosAtom = atom<Todo[]>([]);
const filterAtom = atom<Filter>('all');

// 派生Atom: フィルタリングされたTodo
const filteredTodosAtom = atom((get) => {
  const todos = get(todosAtom);
  const filter = get(filterAtom);

  switch (filter) {
    case 'active':
      return todos.filter((todo) => !todo.completed);
    case 'completed':
      return todos.filter((todo) => todo.completed);
    default:
      return todos;
  }
});

// 派生Atom: 残りのタスク数
const activeCountAtom = atom((get) => {
  const todos = get(todosAtom);
  return todos.filter((todo) => !todo.completed).length;
});

// アクションAtoms（書き込み専用）
const addTodoAtom = atom(
  null, // 読み取り不要
  (get, set, text: string) => {
    const newTodo: Todo = {
      id: Date.now(),
      text,
      completed: false,
    };
    set(todosAtom, [...get(todosAtom), newTodo]);
  }
);

const toggleTodoAtom = atom(
  null,
  (get, set, id: number) => {
    set(
      todosAtom,
      get(todosAtom).map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }
);

const deleteTodoAtom = atom(
  null,
  (get, set, id: number) => {
    set(
      todosAtom,
      get(todosAtom).filter((todo) => todo.id !== id)
    );
  }
);

// コンポーネント
function TodoApp() {
  const filteredTodos = useAtomValue(filteredTodosAtom);
  const activeCount = useAtomValue(activeCountAtom);
  const addTodo = useSetAtom(addTodoAtom);
  const toggleTodo = useSetAtom(toggleTodoAtom);
  const deleteTodo = useSetAtom(deleteTodoAtom);
  const [filter, setFilter] = useAtom(filterAtom);

  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      addTodo(input);
      setInput('');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="新しいタスク"
        />
        <button type="submit">追加</button>
      </form>

      <div>
        <button onClick={() => setFilter('all')}>すべて</button>
        <button onClick={() => setFilter('active')}>未完了</button>
        <button onClick={() => setFilter('completed')}>完了</button>
      </div>

      <p>残り: {activeCount}個</p>

      <ul>
        {filteredTodos.map((todo) => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
              {todo.text}
            </span>
            <button onClick={() => deleteTodo(todo.id)}>削除</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

#### 非同期Atom（Async Atom）

Promiseを返すAtomは自動的にSuspenseと連携します：

```typescript
import { atom, useAtomValue } from 'jotai';
import { Suspense } from 'react';

// 非同期でデータを取得するAtom
const userIdAtom = atom(1);

const userAtom = atom(async (get) => {
  const userId = get(userIdAtom);
  const response = await fetch(`/api/users/${userId}`);
  return response.json();
});

// Suspenseでラップする必要がある
function UserProfile() {
  const user = useAtomValue(userAtom);
  return <div>ユーザー名: {user.name}</div>;
}

function App() {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <UserProfile />
    </Suspense>
  );
}
```

#### atomWithStorage（永続化）

localStorageやsessionStorageに自動で保存できます：

```typescript
import { atomWithStorage } from 'jotai/utils';

// localStorageに保存される
const countAtom = atomWithStorage('count', 0);

// sessionStorageに保存される
const tempCountAtom = atomWithStorage('tempCount', 0, sessionStorage);

function Counter() {
  const [count, setCount] = useAtom(countAtom);

  return (
    <div>
      <p>カウント: {count}</p>
      <button onClick={() => setCount(prev => prev + 1)}>+1</button>
    </div>
  );
}
```

#### atomFamily（動的なAtom）

動的にAtomを生成できます：

```typescript
import { atomFamily } from 'jotai/utils';
import { atom, useAtomValue } from 'jotai';

// ユーザーIDごとにAtomを生成
const userAtomFamily = atomFamily((userId: number) =>
  atom(async () => {
    const response = await fetch(`/api/users/${userId}`);
    return response.json();
  })
);

function UserProfile({ userId }: { userId: number }) {
  const user = useAtomValue(userAtomFamily(userId));
  return <div>ユーザー名: {user.name}</div>;
}

function App() {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <UserProfile userId={1} />
      <UserProfile userId={2} />
      <UserProfile userId={3} />
    </Suspense>
  );
}
```

#### Provider を使ったスコープの分離

デフォルトではAtomはグローバルですが、Providerを使うとスコープを分けられます：

```typescript
import { Provider, atom, useAtom } from 'jotai';

const countAtom = atom(0);

function Counter() {
  const [count, setCount] = useAtom(countAtom);
  return (
    <div>
      <p>カウント: {count}</p>
      <button onClick={() => setCount(prev => prev + 1)}>+1</button>
    </div>
  );
}

function App() {
  return (
    <div>
      <h2>カウンター1（独立）</h2>
      <Provider>
        <Counter />
      </Provider>

      <h2>カウンター2（独立）</h2>
      <Provider>
        <Counter />
      </Provider>

      <h2>カウンター3（独立）</h2>
      <Provider>
        <Counter />
      </Provider>
    </div>
  );
}
```

#### デバッグ

```typescript
import { atom, useAtom } from 'jotai';
import { useAtomDevtools } from 'jotai-devtools';

const countAtom = atom(0);
countAtom.debugLabel = 'countAtom'; // デバッグ用のラベル

function Counter() {
  const [count, setCount] = useAtom(countAtom);

  // DevTools との連携
  useAtomDevtools(countAtom);

  return (
    <div>
      <p>カウント: {count}</p>
      <button onClick={() => setCount(prev => prev + 1)}>+1</button>
    </div>
  );
}
```

#### ユースケース

✅ **適している場合:**
- 小〜中規模アプリケーション
- useState の延長で考えたい
- 状態を細かく分割して管理したい
- React Suspense を活用したい
- TypeScriptの型推論を最大限活用したい
- 柔軟性が必要な場合

❌ **不適切な場合:**
- 厳格な構造が必要な大規模アプリ
- チーム全員がAtomic モデルに不慣れ
- Redux の経験者が多く、Flux パターンが好まれる

#### 長所と短所

**長所:**
- useStateに近い直感的なAPI
- 非常に軽量
- TypeScriptの型推論が優れている
- 必要な部分だけを更新（パフォーマンスが良い）
- React Suspenseとの統合が容易
- ボイラープレートが少ない
- 柔軟性が高い

**短所:**
- Atomicな思考に慣れが必要
- 大規模アプリでAtomが散らばる可能性
- Zustandに比べて概念が若干複雑
- エコシステムがまだ成長中

#### Zustand との比較

| 項目 | Jotai | Zustand |
|-----|-------|---------|
| アーキテクチャ | 分散（Atomic） | 集中（Store） |
| API | useStateに近い | カスタムフック |
| 学習コスト | ⚡⚡⚡⚡☆ | ⚡⚡⚡⚡⚡ |
| 柔軟性 | ⚡⚡⚡⚡⚡ 非常に高い | ⚡⚡⚡⚡☆ 高い |
| 構造化 | ⚡⚡⚡☆☆ 自由度が高い | ⚡⚡⚡⚡☆ ストアで管理 |
| Suspense対応 | ⚡⚡⚡⚡⚡ 標準 | ⚡⚡⚡☆☆ 可能だが限定的 |
| 適用規模 | 小〜中 | 小〜大 |

---

### 3. Redux Toolkit

#### 概要

**「老舗の信頼性、モダンに進化した公式ツールキット」**

Redux Toolkitは、Reduxの公式推奨ツールセットです。従来のReduxの冗長さを大幅に改善し、現代的な開発体験を提供します。

**公式サイト:** https://redux-toolkit.js.org/ & https://redux.js.org/

#### 特徴

- **公式推奨**: Redux チームが推奨する標準的な方法
- **オールインワン**: Redux, Thunk, Immer, Reselect などが統合済み
- **RTK Query**: データ取得・キャッシュ機能を内蔵
- **Redux DevTools**: 強力なタイムトラベルデバッグ
- **エコシステム**: 最も成熟したエコシステム
- **エンタープライズ**: 大規模アプリケーションでの実績

#### 動作原理

- **Store**: アプリケーション全体の状態を保持する単一のオブジェクト
- **Slice**: 機能ごとに状態とReducerをまとめた単位
- **Action**: 状態を変更するためのイベント
- **Reducer**: Actionを受け取って新しい状態を返す純粋関数
- **Dispatch**: Actionをストアに送信する関数

#### インストール

```bash
npm install @reduxjs/toolkit react-redux
# または
yarn add @reduxjs/toolkit react-redux
# または
pnpm add @reduxjs/toolkit react-redux
```

#### 基本的な使い方

```typescript
// store.ts - ストアの設定
import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './features/counter/counterSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

```typescript
// features/counter/counterSlice.ts - Sliceの作成
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CounterState {
  value: number;
  step: number;
}

const initialState: CounterState = {
  value: 0,
  step: 1,
};

const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: (state) => {
      // Immerのおかげで直接変更できる
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
    reset: (state) => {
      state.value = 0;
    },
    setStep: (state, action: PayloadAction<number>) => {
      state.step = action.payload;
    },
  },
});

export const { increment, decrement, incrementByAmount, reset, setStep } = counterSlice.actions;
export default counterSlice.reducer;
```

```typescript
// hooks.ts - 型付きフックの作成
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

```typescript
// App.tsx - プロバイダーの設定
import { Provider } from 'react-redux';
import { store } from './store';
import Counter from './features/counter/Counter';

function App() {
  return (
    <Provider store={store}>
      <Counter />
    </Provider>
  );
}

export default App;
```

```typescript
// features/counter/Counter.tsx - コンポーネント
import { useAppSelector, useAppDispatch } from '../../hooks';
import { increment, decrement, reset, incrementByAmount } from './counterSlice';

function Counter() {
  const count = useAppSelector((state) => state.counter.value);
  const step = useAppSelector((state) => state.counter.step);
  const dispatch = useAppDispatch();

  return (
    <div>
      <p>カウント: {count}</p>
      <p>ステップ: {step}</p>

      <button onClick={() => dispatch(increment())}>+1</button>
      <button onClick={() => dispatch(decrement())}>-1</button>
      <button onClick={() => dispatch(incrementByAmount(step))}>+{step}</button>
      <button onClick={() => dispatch(reset())}>リセット</button>
    </div>
  );
}

export default Counter;
```

#### 非同期処理（createAsyncThunk）

```typescript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface User {
  id: number;
  name: string;
  email: string;
}

interface UserState {
  users: User[];
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  loading: false,
  error: null,
};

// 非同期アクションの作成
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async () => {
    const response = await fetch('/api/users');
    return response.json() as Promise<User[]>;
  }
);

export const addUser = createAsyncThunk(
  'users/addUser',
  async (userData: { name: string; email: string }) => {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return response.json() as Promise<User>;
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchUsers のライフサイクル
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'エラーが発生しました';
      });

    // addUser のライフサイクル
    builder
      .addCase(addUser.fulfilled, (state, action) => {
        state.users.push(action.payload);
      });
  },
});

export const { clearError } = userSlice.actions;
export default userSlice.reducer;
```

```typescript
// UserList.tsx - 非同期処理を使うコンポーネント
import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { fetchUsers, addUser } from './userSlice';

function UserList() {
  const { users, loading, error } = useAppSelector((state) => state.users);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleAddUser = () => {
    dispatch(addUser({ name: 'New User', email: 'new@example.com' }));
  };

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>エラー: {error}</div>;

  return (
    <div>
      <button onClick={handleAddUser}>ユーザー追加</button>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name} ({user.email})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserList;
```

#### Selectors（選択関数）

Selectorを使うと、状態から派生した値を効率的に計算できます：

```typescript
// features/counter/counterSlice.ts
import { createSlice, createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../store';

// ... slice の定義 ...

// 基本的なSelector
export const selectCount = (state: RootState) => state.counter.value;
export const selectStep = (state: RootState) => state.counter.step;

// メモ化されたSelector（createSelectorを使用）
export const selectDoubleCount = createSelector(
  [selectCount],
  (count) => {
    console.log('doubleCount を計算');
    return count * 2;
  }
);

export const selectCountStatus = createSelector(
  [selectCount],
  (count) => {
    if (count === 0) return 'ゼロ';
    if (count > 0) return 'プラス';
    return 'マイナス';
  }
);

// 複数の値を組み合わせたSelector
export const selectCountInfo = createSelector(
  [selectCount, selectStep, selectDoubleCount],
  (count, step, doubleCount) => ({
    count,
    step,
    doubleCount,
    nextValue: count + step,
  })
);
```

```typescript
// Counter.tsx
import { useAppSelector, useAppDispatch } from '../../hooks';
import { selectCount, selectDoubleCount, selectCountStatus } from './counterSlice';
import { increment } from './counterSlice';

function Counter() {
  const count = useAppSelector(selectCount);
  const doubleCount = useAppSelector(selectDoubleCount);
  const status = useAppSelector(selectCountStatus);
  const dispatch = useAppDispatch();

  return (
    <div>
      <p>カウント: {count}</p>
      <p>2倍: {doubleCount}</p>
      <p>状態: {status}</p>
      <button onClick={() => dispatch(increment())}>+1</button>
    </div>
  );
}
```

#### RTK Query（データ取得とキャッシュ）

RTK Queryは、データ取得とキャッシュを自動化する強力な機能です：

```typescript
// services/api.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface User {
  id: number;
  name: string;
  email: string;
}

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    // ユーザー一覧の取得
    getUsers: builder.query<User[], void>({
      query: () => '/users',
      providesTags: ['User'],
    }),

    // 特定のユーザーの取得
    getUser: builder.query<User, number>({
      query: (id) => `/users/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),

    // ユーザーの追加
    addUser: builder.mutation<User, Partial<User>>({
      query: (body) => ({
        url: '/users',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'], // 追加後にユーザー一覧を再取得
    }),

    // ユーザーの更新
    updateUser: builder.mutation<User, Partial<User> & { id: number }>({
      query: ({ id, ...patch }) => ({
        url: `/users/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }],
    }),

    // ユーザーの削除
    deleteUser: builder.mutation<void, number>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserQuery,
  useAddUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = apiSlice;
```

```typescript
// store.ts - RTK Query の統合
import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './services/api';
import counterReducer from './features/counter/counterSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

```typescript
// UserList.tsx - RTK Query を使うコンポーネント
import { useState } from 'react';
import {
  useGetUsersQuery,
  useAddUserMutation,
  useDeleteUserMutation,
} from './services/api';

function UserList() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // データ取得（自動でキャッシュ・再取得される）
  const { data: users, error, isLoading, refetch } = useGetUsersQuery();

  // ミューテーション
  const [addUser, { isLoading: isAdding }] = useAddUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addUser({ name, email }).unwrap();
      setName('');
      setEmail('');
    } catch (err) {
      console.error('Failed to add user:', err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteUser(id).unwrap();
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  if (isLoading) return <div>読み込み中...</div>;
  if (error) return <div>エラーが発生しました</div>;

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="名前"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="メール"
        />
        <button type="submit" disabled={isAdding}>
          追加
        </button>
      </form>

      <button onClick={refetch}>再読み込み</button>

      <ul>
        {users?.map((user) => (
          <li key={user.id}>
            {user.name} ({user.email})
            <button onClick={() => handleDelete(user.id)}>削除</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserList;
```

#### Redux Persist（永続化）

```bash
npm install redux-persist
```

```typescript
// store.ts
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // localStorage
import counterReducer from './features/counter/counterSlice';

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['counter'], // 永続化するreducerを指定
};

const rootReducer = combineReducers({
  counter: counterReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

```typescript
// App.tsx
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import Counter from './features/counter/Counter';

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
        <Counter />
      </PersistGate>
    </Provider>
  );
}

export default App;
```

#### ユースケース

✅ **適している場合:**
- 大規模〜超大規模アプリケーション
- 複雑なビジネスロジック
- タイムトラベルデバッグが必要
- 厳格な状態管理が求められる
- チームに Redux 経験者が多い
- エンタープライズアプリケーション

❌ **不適切な場合:**
- 小規模なアプリ（オーバーエンジニアリング）
- 学習コストをかけたくない
- よりシンプルな解決策で十分な場合

#### 長所と短所

**長所:**
- 最も成熟したエコシステム
- 強力な Redux DevTools
- 大規模アプリケーションでの実績
- 予測可能な状態管理
- タイムトラベルデバッグ
- ミドルウェアの豊富さ
- RTK Query による強力なデータ取得機能

**短所:**
- 学習コストが高い
- ボイラープレートが多い（改善されたが）
- 小規模アプリには過剰
- Providerの設定が必要

---

### 4. TanStack Query（React Query）

#### 概要

**「サーバー状態管理の専門家」**

TanStack Query（旧React Query）は、サーバーからのデータ取得、キャッシュ、同期、更新を専門に扱うライブラリです。useEffectでのデータ取得を革新的に改善します。

**公式サイト:** https://tanstack.com/query

#### 特徴

- **サーバー状態特化**: API通信とキャッシュに特化
- **自動キャッシュ**: データを自動でキャッシュし、再利用
- **自動再取得**: バックグラウンドで自動的にデータを更新
- **オフライン対応**: オフライン時の挙動を制御
- **楽観的更新**: UIを先に更新して、後で同期
- **無限スクロール**: ページネーションや無限スクロールを簡単に実装

#### 重要な概念

- **クライアント状態**: UIの状態（モーダルの開閉など）→ Zustand/Jotaiで管理
- **サーバー状態**: サーバーのデータ（ユーザー情報など）→ TanStack Queryで管理

#### 動作原理

- **Query**: データの取得（GET）
- **Mutation**: データの変更（POST, PUT, DELETE）
- **Query Key**: クエリを識別する一意のキー
- **Stale Time**: データが古くなるまでの時間
- **Cache Time**: キャッシュを保持する時間
- **Refetch**: データの再取得

#### インストール

```bash
npm install @tanstack/react-query
# または
yarn add @tanstack/react-query
# または
pnpm add @tanstack/react-query

# DevTools（開発時に便利）
npm install @tanstack/react-query-devtools
```

#### 基本的な使い方

```typescript
// App.tsx - QueryClientの設定
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import UserList from './UserList';

// QueryClientの作成
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5分間はデータを新鮮とみなす
      cacheTime: 1000 * 60 * 10, // 10分間キャッシュを保持
      retry: 1, // 失敗時に1回リトライ
      refetchOnWindowFocus: false, // ウィンドウフォーカス時の再取得を無効化
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserList />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
```

```typescript
// UserList.tsx - useQuery の使用
import { useQuery } from '@tanstack/react-query';

interface User {
  id: number;
  name: string;
  email: string;
}

async function fetchUsers(): Promise<User[]> {
  const response = await fetch('/api/users');
  if (!response.ok) {
    throw new Error('ユーザーの取得に失敗しました');
  }
  return response.json();
}

function UserList() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['users'], // クエリを識別する一意のキー
    queryFn: fetchUsers, // データ取得関数
  });

  if (isLoading) return <div>読み込み中...</div>;
  if (isError) return <div>エラー: {error.message}</div>;

  return (
    <div>
      <button onClick={() => refetch()}>再読み込み</button>
      <ul>
        {data?.map((user) => (
          <li key={user.id}>
            {user.name} ({user.email})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserList;
```

#### パラメータ付きクエリ

```typescript
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
}

async function fetchUser(userId: number): Promise<User> {
  const response = await fetch(`/api/users/${userId}`);
  if (!response.ok) {
    throw new Error('ユーザーの取得に失敗しました');
  }
  return response.json();
}

function UserProfile() {
  const [userId, setUserId] = useState(1);

  // Query Key に userId を含めることで、userIdごとにキャッシュされる
  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['user', userId], // userIdが変わると自動で再取得
    queryFn: () => fetchUser(userId),
  });

  if (isLoading) return <div>読み込み中...</div>;
  if (isError) return <div>エラーが発生しました</div>;

  return (
    <div>
      <button onClick={() => setUserId(userId - 1)}>前のユーザー</button>
      <button onClick={() => setUserId(userId + 1)}>次のユーザー</button>

      <h2>{user?.name}</h2>
      <p>{user?.email}</p>
    </div>
  );
}
```

#### Mutation（データの変更）

```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
}

interface CreateUserInput {
  name: string;
  email: string;
}

async function fetchUsers(): Promise<User[]> {
  const response = await fetch('/api/users');
  return response.json();
}

async function createUser(userData: CreateUserInput): Promise<User> {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    throw new Error('ユーザーの作成に失敗しました');
  }
  return response.json();
}

async function deleteUser(userId: number): Promise<void> {
  const response = await fetch(`/api/users/${userId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('ユーザーの削除に失敗しました');
  }
}

function UserList() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const queryClient = useQueryClient();

  // データ取得
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  // ユーザー作成のMutation
  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      // 成功したらユーザー一覧を無効化（自動で再取得される）
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setName('');
      setEmail('');
    },
  });

  // ユーザー削除のMutation
  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ name, email });
  };

  if (isLoading) return <div>読み込み中...</div>;

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="名前"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="メール"
        />
        <button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? '追加中...' : '追加'}
        </button>
      </form>

      {createMutation.isError && (
        <p>エラー: {createMutation.error.message}</p>
      )}

      <ul>
        {users?.map((user) => (
          <li key={user.id}>
            {user.name} ({user.email})
            <button
              onClick={() => deleteMutation.mutate(user.id)}
              disabled={deleteMutation.isPending}
            >
              削除
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserList;
```

#### 楽観的更新（Optimistic Updates）

UIを先に更新して、後でサーバーと同期します：

```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

async function updateTodo(todo: Todo): Promise<Todo> {
  const response = await fetch(`/api/todos/${todo.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(todo),
  });
  return response.json();
}

function TodoList() {
  const queryClient = useQueryClient();

  const { data: todos } = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
  });

  const updateMutation = useMutation({
    mutationFn: updateTodo,

    // Mutationが始まる直前
    onMutate: async (newTodo) => {
      // 進行中のクエリをキャンセル
      await queryClient.cancelQueries({ queryKey: ['todos'] });

      // 現在のデータを保存（ロールバック用）
      const previousTodos = queryClient.getQueryData<Todo[]>(['todos']);

      // 楽観的にUIを更新
      queryClient.setQueryData<Todo[]>(['todos'], (old) =>
        old?.map((todo) => (todo.id === newTodo.id ? newTodo : todo))
      );

      // ロールバック用のコンテキストを返す
      return { previousTodos };
    },

    // エラーが発生したらロールバック
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['todos'], context?.previousTodos);
    },

    // 成功/失敗に関わらず最後に実行
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  const handleToggle = (todo: Todo) => {
    updateMutation.mutate({ ...todo, completed: !todo.completed });
  };

  return (
    <ul>
      {todos?.map((todo) => (
        <li key={todo.id}>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => handleToggle(todo)}
          />
          <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
            {todo.text}
          </span>
        </li>
      ))}
    </ul>
  );
}
```

#### 無限スクロール

```typescript
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

interface Post {
  id: number;
  title: string;
  body: string;
}

interface PostsResponse {
  posts: Post[];
  nextCursor: number | null;
}

async function fetchPosts({ pageParam = 0 }): Promise<PostsResponse> {
  const response = await fetch(`/api/posts?cursor=${pageParam}&limit=10`);
  return response.json();
}

function PostList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
  });

  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) return <div>読み込み中...</div>;

  return (
    <div>
      {data?.pages.map((page, i) => (
        <div key={i}>
          {page.posts.map((post) => (
            <div key={post.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
              <h3>{post.title}</h3>
              <p>{post.body}</p>
            </div>
          ))}
        </div>
      ))}

      <div ref={observerTarget} style={{ height: '20px' }} />

      {isFetchingNextPage && <div>さらに読み込み中...</div>}
    </div>
  );
}
```

#### Prefetching（事前取得）

```typescript
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

function UserList() {
  const [hoveredUserId, setHoveredUserId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  // マウスホバー時にユーザー詳細を事前取得
  const handleMouseEnter = (userId: number) => {
    setHoveredUserId(userId);

    queryClient.prefetchQuery({
      queryKey: ['user', userId],
      queryFn: () => fetchUser(userId),
    });
  };

  return (
    <ul>
      {users?.map((user) => (
        <li
          key={user.id}
          onMouseEnter={() => handleMouseEnter(user.id)}
        >
          {user.name}
        </li>
      ))}
    </ul>
  );
}
```

#### ユースケース

✅ **適している場合:**
- サーバーからのデータ取得が必要
- リアルタイムでデータを最新に保ちたい
- キャッシュやローディング状態の管理を自動化したい
- 無限スクロールやページネーション
- 楽観的更新が必要
- useEffect でのデータ取得が煩雑になっている

❌ **不適切な場合:**
- ローカル状態のみのアプリ
- サーバー通信がないアプリ
- 静的なデータのみを扱う

#### 長所と短所

**長所:**
- useEffect でのデータ取得を劇的に改善
- 自動キャッシュ・再取得
- ローディング・エラー状態の自動管理
- 楽観的更新が簡単
- 無限スクロールの実装が容易
- オフライン対応
- 強力な DevTools

**短所:**
- サーバー状態専用（ローカル状態には不向き）
- 学習コストがやや高い
- クエリキーの管理が必要

#### Zustand / Jotai との組み合わせ

**推奨される構成:**
- **TanStack Query**: サーバー状態（API から取得するデータ）
- **Zustand / Jotai**: クライアント状態（UI の状態、フォーム入力など）

```typescript
// ✅ 良い例：役割分担が明確
import { useQuery } from '@tanstack/react-query';
import { atom, useAtom } from 'jotai';

// サーバー状態 → TanStack Query
function UserList() {
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  // クライアント状態 → Jotai
  const filterAtom = atom<'all' | 'active'>('all');
  const [filter, setFilter] = useAtom(filterAtom);

  const filteredUsers = users?.filter(user =>
    filter === 'all' || user.status === filter
  );

  return (
    <div>
      <button onClick={() => setFilter('all')}>すべて</button>
      <button onClick={() => setFilter('active')}>アクティブ</button>

      <ul>
        {filteredUsers?.map(user => <li key={user.id}>{user.name}</li>)}
      </ul>
    </div>
  );
}
```

---

### 5. Recoil

#### 概要

**「Facebook製のAtomic状態管理（開発停滞中）」**

RecoilはJotaiと同様のAtomic（原子的）状態管理ライブラリです。Facebook（Meta）が開発しましたが、2024年現在、開発が停滞気味です。

**公式サイト:** https://recoiljs.org/

#### 特徴

- **Atomic**: Jotai と同じAtom ベースのアーキテクチャ
- **React統合**: Reactのための設計
- **非同期サポート**: Promiseをネイティブサポート
- **Suspense対応**: React Suspense との統合

#### 現状と推奨

⚠️ **重要**: Recoilは現在、開発が停滞しています。新規プロジェクトでは、より活発に開発されている **Jotai** の使用を推奨します。

Jotai は Recoil の影響を受けて作られており、より軽量で、同じような API を提供しながら、活発に開発されています。

#### 基本的な使い方（参考）

```typescript
import { atom, useRecoilState, useRecoilValue, RecoilRoot } from 'recoil';

// Atom の定義
const countState = atom({
  key: 'countState', // 一意のキーが必要（Jotaiとの違い）
  default: 0,
});

function Counter() {
  const [count, setCount] = useRecoilState(countState);

  return (
    <div>
      <p>カウント: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
}

// RecoilRoot で囲む必要がある（Jotaiとの違い）
function App() {
  return (
    <RecoilRoot>
      <Counter />
    </RecoilRoot>
  );
}
```

#### Jotai との主な違い

| 項目 | Recoil | Jotai |
|-----|--------|-------|
| 開発状況 | 停滞気味 | 活発 |
| AtomのKey | 必要（文字列） | 不要 |
| RecoilRoot | 必須 | 任意 |
| バンドルサイズ | やや大きい | 非常に小さい |
| TypeScript | 型推論やや弱い | 型推論が優秀 |

#### 移行の推奨

既存のRecoilプロジェクトを持っている場合でも、Jotaiへの移行は比較的簡単です。APIが非常に似ているため、大きな書き換えは不要です。

**Recoilを学ぶより、Jotaiを学ぶことを強く推奨します。**

---

## 選択ガイド

### 全体比較表

以下の表で、すべての状態管理手法を比較します：

| 項目 | useState | useContext | useReducer | Zustand | Jotai | Redux Toolkit | TanStack Query |
|-----|----------|------------|-----------|---------|-------|---------------|----------------|
| **学習コスト** | ⚡⚡⚡⚡⚡ | ⚡⚡⚡⚡☆ | ⚡⚡⚡☆☆ | ⚡⚡⚡⚡⚡ | ⚡⚡⚡⚡☆ | ⚡⚡☆☆☆ | ⚡⚡⚡☆☆ |
| **ボイラープレート** | 最小 | 少ない | 中程度 | 最小 | 最小 | 多い | 少ない |
| **パフォーマンス** | ⚡⚡⚡⚡⚡ | ⚡⚡☆☆☆ | ⚡⚡⚡⚡☆ | ⚡⚡⚡⚡⚡ | ⚡⚡⚡⚡⚡ | ⚡⚡⚡⚡☆ | ⚡⚡⚡⚡⚡ |
| **TypeScript** | ⚡⚡⚡⚡☆ | ⚡⚡⚡⚡☆ | ⚡⚡⚡⚡☆ | ⚡⚡⚡⚡⚡ | ⚡⚡⚡⚡⚡ | ⚡⚡⚡⚡⚡ | ⚡⚡⚡⚡⚡ |
| **DevTools** | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ 最強 | ✅ |
| **エコシステム** | N/A | N/A | N/A | ⚡⚡⚡☆☆ | ⚡⚡⚡☆☆ | ⚡⚡⚡⚡⚡ | ⚡⚡⚡⚡☆ |
| **適用規模** | 極小 | 小 | 小〜中 | 小〜大 | 小〜中 | 中〜超大 | 全規模 |
| **主な用途** | ローカル状態 | データ配信 | 複雑なロジック | グローバル状態 | グローバル状態 | グローバル状態 | サーバー状態 |

### アーキテクチャによる分類

```
┌─────────────────────────────────────────────────────────────────┐
│ ① ローカル状態（Component-Local）                               │
│    useState, useReducer                                         │
│    範囲: 単一コンポーネント内                                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ ② 依存性注入型（Dependency Injection）                           │
│    useContext                                                   │
│    範囲: コンポーネントツリー                                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ ③ 集中管理型（Centralized Store）                                │
│    Zustand, Redux Toolkit                                       │
│    範囲: アプリケーション全体（一箇所で管理）                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ ④ 分散型（Atomic / Decentralized）                              │
│    Jotai, Recoil                                                │
│    範囲: アプリケーション全体（小さな単位で分散）                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ ⑤ サーバー状態特化型（Server State）                             │
│    TanStack Query, SWR                                          │
│    範囲: サーバーとの通信・キャッシュ                              │
└─────────────────────────────────────────────────────────────────┘
```

### 決定フローチャート

以下のフローチャートで、最適な状態管理手法を選択できます：

```
【ステップ1】その状態はどこから来る？
│
├─ サーバー（API）から取得する
│  └─ ✅ TanStack Query（一択）
│
└─ クライアント側で生成・管理する
   └─ 次へ

【ステップ2】その状態の共有範囲は？
│
├─ 単一のコンポーネント内だけで使う
│  ├─ シンプルな値
│  │  └─ ✅ useState
│  └─ 複雑なロジックがある
│     └─ ✅ useReducer
│
└─ 複数のコンポーネントで共有する
   └─ 次へ

【ステップ3】更新頻度と規模は？
│
├─ 更新頻度が低い（テーマ、言語設定など）
│  └─ ✅ useContext
│
├─ 更新頻度が高い or 中〜大規模アプリ
│  ├─ 一箇所で集中管理したい
│  │  ├─ 大規模・厳格なルールが必要
│  │  │  └─ ✅ Redux Toolkit
│  │  └─ シンプルに始めたい
│  │     └─ ✅ Zustand
│  │
│  └─ 細かく分散して管理したい
│     └─ ✅ Jotai
```

### 具体的なシナリオ別の推奨

#### シナリオ1: 小規模な個人プロジェクト

```
📌 推奨構成:
- ローカル状態: useState
- グローバル状態: Zustand or Jotai
- サーバー状態: TanStack Query

理由: 学習コストが低く、すぐに始められる
```

#### シナリオ2: 中規模なチーム開発

```
📌 推奨構成:
- ローカル状態: useState / useReducer
- グローバル状態: Zustand
- サーバー状態: TanStack Query

理由: チーム全員が理解しやすく、保守性が高い
```

#### シナリオ3: 大規模なエンタープライズアプリ

```
📌 推奨構成:
- ローカル状態: useState / useReducer
- グローバル状態: Redux Toolkit
- サーバー状態: RTK Query or TanStack Query

理由: 厳格な構造と強力なデバッグツールが必要
```

#### シナリオ4: スタートアップ（速度重視）

```
📌 推奨構成:
- ローカル状態: useState
- グローバル状態: Zustand or Jotai
- サーバー状態: TanStack Query

理由: 開発速度を最優先、後で拡張も可能
```

### 2024-2025年のトレンド

現在のReact開発現場で最も人気のある組み合わせ：

#### 🏆 最もバランスが良い構成（推奨）

```typescript
// グローバル状態: Zustand
import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));

// サーバー状態: TanStack Query
import { useQuery } from '@tanstack/react-query';

function UserList() {
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  return <ul>{users?.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
```

#### 🚀 モダン・柔軟性重視の構成

```typescript
// グローバル状態: Jotai
import { atom, useAtom } from 'jotai';

const userAtom = atom(null);
const themeAtom = atom('light');

function Profile() {
  const [user] = useAtom(userAtom);
  const [theme] = useAtom(themeAtom);

  return <div className={theme}>{user?.name}</div>;
}

// サーバー状態: TanStack Query
// （上記と同じ）
```

#### 🏢 エンタープライズ・信頼性重視の構成

```typescript
// グローバル状態: Redux Toolkit
import { configureStore, createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
});

// サーバー状態: RTK Query
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: (builder) => ({
    getUsers: builder.query({ query: () => '/users' }),
  }),
});
```

### よくある質問（FAQ）

#### Q1: Zustand と Jotai、どちらを選ぶべき？

**A:** 好みの問題ですが、以下を参考にしてください：

- **Zustand を選ぶべき人**:
  - 一箇所で状態をまとめて管理したい
  - ストアという概念が好き
  - Redux からの移行を考えている

- **Jotai を選ぶべき人**:
  - useState の延長で考えたい
  - 状態を細かく分割したい
  - React Suspense を活用したい

#### Q2: Redux はもう古い？

**A:** いいえ、Redux（Redux Toolkit）は今でも優秀です：

- 大規模アプリケーションでは今でも最良の選択肢の一つ
- エンタープライズ開発では信頼性が重要
- 学習コストは高いが、それに見合う価値がある

ただし、小〜中規模のアプリでは Zustand や Jotai の方が効率的です。

#### Q3: TanStack Query は必須？

**A:** サーバーからデータを取得するなら、**ほぼ必須**です：

- useEffect でのデータ取得は非効率
- キャッシュ・再取得・エラーハンドリングを自動化
- 開発体験が劇的に向上

#### Q4: Context API だけでは不十分？

**A:** 小規模なら十分ですが、以下の問題があります：

- パフォーマンス最適化が難しい
- 複数の Context を使うとネストが深くなる
- デバッグツールがない

中規模以上なら Zustand / Jotai の導入を推奨します。

---

## まとめ

### 初心者へのロードマップ

#### フェーズ1: 基礎を固める（1-2週間）

1. **useState** を完全に理解する
2. **useEffect** でデータ取得を体験する
3. **useContext** で Prop Drilling を解消する

#### フェーズ2: モダンな手法を学ぶ（2-3週間）

1. **TanStack Query** でサーバー状態管理を学ぶ
2. **Zustand** でグローバル状態管理を学ぶ

#### フェーズ3: 選択肢を広げる（必要に応じて）

1. **Jotai** を試して違いを体感する
2. 大規模開発なら **Redux Toolkit** も学ぶ

### 最後に

状態管理は**「銀の弾丸」はありません**。プロジェクトの規模、チームの経験、要件に応じて最適な手法を選択することが重要です。

**2024-2025年の鉄板構成:**

```
✅ サーバー状態: TanStack Query
✅ グローバル状態: Zustand または Jotai
✅ ローカル状態: useState
```

この組み合わせで、ほとんどのReactアプリケーションを効率的に開発できます。

まずは小さく始めて、必要に応じて拡張していきましょう！

---

## 参考リンク

### 公式ドキュメント

- **React公式**: https://ja.react.dev/
- **Zustand**: https://github.com/pmndrs/zustand
- **Jotai**: https://jotai.org/
- **Redux Toolkit**: https://redux-toolkit.js.org/
- **TanStack Query**: https://tanstack.com/query
- **Recoil**: https://recoiljs.org/

### 学習リソース

- React Context API: https://ja.react.dev/learn/passing-data-deeply-with-context
- Redux公式チュートリアル: https://redux.js.org/tutorials/essentials/part-1-overview-concepts

---

**最終更新日**: 2025年11月23日


