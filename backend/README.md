# Backend

このディレクトリには、Gopher Stamp Rally アプリケーションのバックエンドサービスが含まれています。

## プロジェクト構成

```
backend/
├── configs/                    # 設定ファイル
│   ├── golangci.yml           # Go linter設定
│   ├── lint-options.env       # Lint設定
│   ├── swagger-options.env    # Swagger生成設定
│   ├── mock-options.env       # Mock生成設定
│   └── wire-options.env       # Wire DI設定
├── docs/                      # API仕様書
│   └── swagger/
│       └── gopher-stamp-crud.yml
├── services/                  # サービス実装
│   └── gopher-stamp-crud/     # メインサービス
│       ├── cmd/               # エントリーポイント
│       ├── internal/          # 内部実装
│       │   ├── domain/        # ドメイン層
│       │   ├── infrastructure/ # インフラ層
│       │   ├── interface/     # インターフェース層
│       │   └── usecase/       # ユースケース層
│       └── swagger/           # 生成されたSwaggerコード
├── docker-compose.yml         # 開発環境用Docker Compose
├── Makefile                   # 開発用コマンド
└── go.mod                     # Go依存関係
```

## 開発環境セットアップ

### 前提条件

- Go 1.24.0
- Docker & Docker Compose
- golangci-lint
- oapi-codegen

### 初期セットアップ

1. 依存関係のインストール
```bash
go mod download
```

2. 開発環境の起動
```bash
make compose-up
```

## Makefile コマンド

### 基本コマンド

| コマンド | 説明 |
|---------|------|
| `make build` | 全サービスをビルド |
| `make test` | 全テストを実行 |
| `make lint` | コードリントを実行 |
| `make tidy` | go.modを整理 |

### Docker関連

| コマンド | 説明 |
|---------|------|
| `make compose-up` | Docker Composeでサービス起動 |
| `make compose-down` | Docker Composeでサービス停止 |

### コード生成

| コマンド | 説明 |
|---------|------|
| `make swagger-gen` | Swaggerコード生成 |
| `make swagger-check` | Swaggerファイルの整合性チェック |
| `make mock-gen` | Mockファイル生成 |
| `make mock-check` | Mockファイルの整合性チェック |
| `make wire-gen` | Wire DIコード生成 |
| `make wire-check` | Wireファイルの整合性チェック |

## コーディングガイドライン

### アーキテクチャ

このプロジェクトは **Clean Architecture** を採用しています：

- **Domain層**: ビジネスロジックとエンティティ
- **Infrastructure層**: データベース、外部API連携
- **Interface層**: HTTPハンドラー、API定義
- **Usecase層**: アプリケーションロジック

### ディレクトリ構造の規則

```
internal/
├── domain/
│   ├── entity/           # エンティティ定義
│   ├── repository/       # リポジトリインターフェース
│   └── mock_repository/  # 生成されたMock
├── infrastructure/
│   └── mysql/           # データベース実装
├── interface/
│   └── handler/         # HTTPハンドラー
└── usecase/            # ビジネスロジック
```


### 開発フロー

#### 1. 新機能開発時

1. ブランチ作成
```bash
git checkout -b feature/new-feature
```

2. コード実装
swaggerのymlファイルを作成した場合はswagger-genを実行してください。
```bash
make swagger-gen
```
repo層のinterfaceを作成した場合はmock-genを実行してください。
```bash
make mock-gen
```
wire.goを追記した場合(DIする層を追加した場合)はwire-genを実行してください。
```bash
make wire-gen
```
Handler層を実装する際は`swagger-gen`を実行して生成されたswaggerコードでwrapしているので、handlerで実装


3. build実行
```bash
make build
```

4. test作成・実行(usecase層のテストは最低限作成して！)
```bash
make test
```

5. lint実行
```bash
make lint
```


6. コミット・プッシュ

#### 2. プルリクエスト作成前

以下のコマンドを実行して、すべてのチェックをパスすることを確認：

```bash
# ビルド確認
make build

# テスト実行
make test

# リント実行
make lint

# 生成ファイルの整合性チェック
## swaggerの整合性チェック
make swagger-check

## mockの整合性チェック
make mock-check

## wireの整合性チェック
make wire-check
```

#### 3. データベース変更時
migration fileをどうにかするのはやっていないのでそのうちやります。SQL-DDLは自前でmysqlに入って実行してください

