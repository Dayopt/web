# /content/CLAUDE.md - コンテンツ管理（MDX）ガイド

## この文書の位置づけ

**レベル2**: 領域特化ルール（コンテンツ管理・MDX）
- 上位: `/src/CLAUDE.md`（実装の基本）
- 上位: `/CLAUDE.md`（意思決定プロトコル）

**役割**: MDXコンテンツの作成・管理方法を定義

---

## 基本原則

### 1. MDXファイル必須
- **HTML直書き禁止**: すべてのコンテンツはMDXで管理
- **外部画像URL禁止**: `/public/images`配下の画像を使用

### 2. Frontmatter必須
- すべてのMDXファイルにFrontmatterを記述
- 型安全性を確保

### 3. 多言語対応
- 英語・日本語の両方でコンテンツを用意

---

## contentディレクトリ構造

```
content/
├── blog/                  # ブログ記事
│   ├── en/
│   │   └── timeboxing-with-dayopt.mdx
│   └── ja/
│       └── timeboxing-with-dayopt.mdx
├── docs/                  # ドキュメント
│   ├── en/
│   │   ├── getting-started/
│   │   ├── features/
│   │   ├── guides/
│   │   ├── troubleshooting/
│   │   └── account/
│   └── ja/
│       ├── getting-started/
│       ├── features/
│       ├── guides/
│       ├── troubleshooting/
│       └── account/
└── releases/              # リリースノート
    ├── en/
    │   └── v0.16.0.mdx
    └── ja/
        └── v0.16.0.mdx
```

---

## AI/RAGメタデータ（Human-AI Dual Purpose Docs）

### 概要

すべてのMDXファイルには、AIチャットボット/RAGシステム用のメタデータを追加する。
このメタデータはYAML frontmatter内に記述され、**ユーザーには表示されない**。

### 設計方針（重複回避）

**既存フィールドを流用し、重複を避ける:**
- `keywords` → 既存の `tags` フィールドを使用（aiに書かない）
- `aiSummary` → 既存の `description` フィールドを使用（aiに書かない）
- **手動で書くのは `relatedQuestions` のみ**

### 型定義（src/types/content.ts）

```typescript
export interface AIMetadata {
  relatedQuestions?: string[]   // 🔴 手動必須: ユーザーが尋ねそうな質問
  prerequisites?: string[]      // 前提知識（必要に応じて）
  relatedDocs?: string[]        // 関連ドキュメントパス（必要に応じて）
  chunkStrategy?: 'h2' | 'h3' | 'paragraph' | 'full'  // チャンキング戦略
  searchable?: boolean          // 検索対象フラグ
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  contentType?: 'tutorial' | 'reference' | 'guide' | 'troubleshooting' | 'concept'
}

// ※ keywords と aiSummary は削除済み（tags, description を流用）
```

### AI メタデータテンプレート（簡略版）

```yaml
# === AI/RAG用メタデータ ===
ai:
  relatedQuestions:            # 🔴 手動で書く（3-5個推奨）
    - "ユーザーが尋ねそうな質問1？"
    - "ユーザーが尋ねそうな質問2？"
    - "ユーザーが尋ねそうな質問3？"
  chunkStrategy: "h2"
  searchable: true
  difficulty: "intermediate"   # beginner / intermediate / advanced
  contentType: "guide"         # tutorial / reference / guide / troubleshooting / concept
```

### フィールド説明

| フィールド | 必須 | 説明 |
|-----------|------|------|
| `relatedQuestions` | ✅ | ユーザーがチャットボットに尋ねそうな質問。**手動で記述が必要** |
| `prerequisites` | ❌ | このコンテンツを理解するための前提知識 |
| `relatedDocs` | ❌ | 関連ドキュメントへのパス（チャットボットが追加情報として提示） |
| `chunkStrategy` | ✅ | RAGチャンキング戦略。通常は`h2`（見出しレベル2で分割） |
| `searchable` | ✅ | `true`にすると検索対象。`false`で除外 |
| `difficulty` | ✅ | 難易度レベル（初心者向けか上級者向けか） |
| `contentType` | ✅ | コンテンツの種類（チュートリアル、リファレンス等） |

### 流用されるフィールド（aiセクションに書かない）

| 用途 | 流用元 | 説明 |
|------|--------|------|
| キーワード | `tags` | 既存のタグがそのままRAG検索用キーワードになる |
| AI用要約 | `description` | 既存の説明文がAI回答生成時の要約になる |

### contentType の選び方

| タイプ | 説明 | 例 |
|--------|------|-----|
| `tutorial` | 手順を追って学ぶ形式 | インストールガイド、はじめてのログ送信 |
| `reference` | 参照用の情報 | API仕様、リリースノート、設定オプション一覧 |
| `guide` | ベストプラクティスや解説 | 設計ガイドライン、パフォーマンス最適化 |
| `troubleshooting` | 問題解決方法 | よくあるエラーと対処法 |
| `concept` | 概念や理論の説明 | アーキテクチャ解説、用語説明 |

### difficulty の選び方

| レベル | 説明 |
|--------|------|
| `beginner` | 初心者向け。前提知識なしで理解可能 |
| `intermediate` | 中級者向け。基本知識を前提 |
| `advanced` | 上級者向け。深い知識を前提 |

---

## MDXファイル作成ガイド

### ブログ記事（content/blog/{en,ja}/*.mdx）

#### Frontmatter構造（AI メタデータ含む）

```yaml
---
title: "記事タイトル"
description: "記事の説明文（SEO用 + AI要約として流用）"
publishedAt: "2025-01-23"
updatedAt: "2025-01-23"
tags: ["Next.js", "React", "TypeScript"]  # ← RAGキーワードとして流用
category: "Technology"
author: "著者名"
authorAvatar: "/avatars/author.jpg"
coverImage: "/images/blog/cover.jpg"
featured: true
draft: false

# === AI/RAG用メタデータ（簡略版） ===
ai:
  relatedQuestions:              # 🔴 手動で書く
    - "Next.jsでSaaSを作るには？"
    - "App Routerの使い方は？"
  chunkStrategy: "h2"
  searchable: true
  difficulty: "intermediate"
  contentType: "tutorial"
---
```

#### フィールド定義

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `title` | string | ✅ | 記事タイトル（SEO重要） |
| `description` | string | ✅ | 記事の説明文（SEO用・meta description） |
| `publishedAt` | string | ✅ | 公開日（ISO 8601形式: `YYYY-MM-DD`） |
| `updatedAt` | string | ❌ | 更新日（ISO 8601形式） |
| `tags` | string[] | ✅ | タグ（検索・分類用） |
| `category` | string | ✅ | カテゴリー（Technology, Business, Design等） |
| `author` | string | ✅ | 著者名 |
| `authorAvatar` | string | ❌ | 著者アバター画像パス（`/avatars/*`） |
| `coverImage` | string | ❌ | カバー画像パス（`/images/blog/*`） |
| `featured` | boolean | ❌ | トップページに表示するか（デフォルト: `false`） |
| `draft` | boolean | ❌ | 下書きか（デフォルト: `false`、`true`の場合非公開） |

#### 完全な例

```mdx
---
title: "Complete Guide to Building SaaS Applications with Next.js 14"
description: "Learn how to build scalable SaaS applications using Next.js 14's latest features. Comprehensive coverage from App Router and Server Components to authentication system implementation."
publishedAt: "2025-01-23"
updatedAt: "2025-01-24"
tags: ["Next.js", "React", "SaaS", "TypeScript", "Development", "Full Stack"]
category: "Technology"
author: "Takeshi Yamada"
authorAvatar: "/avatars/takeshi-yamada.jpg"
coverImage: "/images/blog/nextjs-saas-guide.jpg"
featured: true
draft: false
---

# Complete Guide to Building SaaS Applications with Next.js 14

Next.js 14 provides numerous innovative features for SaaS application development. This article details how to build production-ready SaaS applications with specific code examples.

## Why Next.js 14?

Next.js 14 is ideal for SaaS development for the following reasons:

- **App Router**: New routing system with more intuitive file structure
- **Server Components**: Faster performance through server-side component rendering
- **Streaming**: Improved UX with progressive page loading

## Code Example

```typescript
export default async function Page() {
  const data = await fetchData()
  return <div>{data}</div>
}
```

## Conclusion

Next.js 14 is a powerful framework for building modern SaaS applications.
```

---

### ドキュメント（content/docs/**/*.mdx）

#### Frontmatter構造（AI メタデータ含む）

```yaml
---
title: "ドキュメントタイトル"
description: "ドキュメントの説明（AI要約として流用）"
category: "Getting Started"
order: 1
updatedAt: "2025-01-23"
tags: ["setup", "configuration"]  # ← RAGキーワードとして流用

# === AI/RAG用メタデータ（簡略版） ===
ai:
  relatedQuestions:              # 🔴 手動で書く
    - "インストール方法は？"
    - "必要な前提条件は？"
  chunkStrategy: "h2"
  searchable: true
  difficulty: "beginner"
  contentType: "tutorial"
---
```

#### フィールド定義

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `title` | string | ✅ | ドキュメントタイトル |
| `description` | string | ✅ | ドキュメントの説明 |
| `category` | string | ✅ | カテゴリー（Getting Started, API Reference等） |
| `order` | number | ❌ | 表示順序（昇順） |
| `updatedAt` | string | ❌ | 更新日（ISO 8601形式） |
| `tags` | string[] | ❌ | タグ |
| `draft` | boolean | ❌ | 下書き（`true` で非公開） |
| `featured` | boolean | ❌ | 注目コンテンツか |
| `ai` | AIMetadata | ❌ | AI/RAGメタデータ（上記参照） |

---

### リリースノート（content/releases/{en,ja}/*.mdx）

#### Frontmatter構造（AI メタデータ含む）

```yaml
---
version: "2.0.0"
date: "2025-01-23"
title: "次世代プラットフォームへの大型アップデート"
description: "完全に再設計されたアーキテクチャと新UI（AI要約として流用）"
tags: ["frontend", "backend", "breaking"]  # ← RAGキーワードとして流用
breaking: true
featured: true
author: "田中一郎"
authorAvatar: "/avatars/tanaka-ichiro.jpg"

# === AI/RAG用メタデータ（簡略版） ===
ai:
  relatedQuestions:              # 🔴 手動で書く
    - "v2.0.0の主な変更点は？"
    - "v1.xからの移行方法は？"
    - "破壊的変更は何？"
  chunkStrategy: "h2"
  searchable: true
  difficulty: "advanced"
  contentType: "reference"
---
```

#### フィールド定義

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `version` | string | ✅ | バージョン番号（Semantic Versioning） |
| `title` | string | ✅ | リリースタイトル |
| `date` | string | ✅ | リリース日（ISO 8601形式） |
| `description` | string | ✅ | リリースの説明 |
| `featured` | boolean | ❌ | 注目リリースか（デフォルト: `false`） |
| `breaking` | boolean | ❌ | 破壊的変更を含むか（デフォルト: `false`） |
| `tags` | string[] | ✅ | タグ（frontend, backend, security, breaking等） |
| `author` | string | ❌ | 著者名 |
| `authorAvatar` | string | ❌ | 著者アバター画像パス |
| `coverImage` | string | ❌ | カバー画像パス |
| `ai` | AIMetadata | ❌ | AI/RAGメタデータ（上記参照） |

#### 完全な例

```mdx
---
version: "2.0.0"
title: "Major Update - New UI and Performance Improvements"
date: "2025-01-23"
type: "major"
featured: true
breaking: true
tags: ["new", "improvement", "breaking"]
---

# v2.0.0 - Major Update

## 🎉 New Features

- **New Design System**: Completely redesigned UI with modern aesthetics
- **Dark Mode**: System-wide dark mode support
- **Real-time Collaboration**: Work together with your team in real-time

## 🚀 Improvements

- **Performance**: 50% faster page load times
- **Accessibility**: WCAG 2.1 AA compliant
- **Mobile**: Improved mobile experience

## 🔧 Bug Fixes

- Fixed issue with authentication timeout
- Resolved memory leak in dashboard

## ⚠️ Breaking Changes

- **API v1 Deprecated**: Please migrate to API v2
- **Config Format Changed**: Update your configuration files

## 📖 Migration Guide

See our [Migration Guide](/docs/migration-v2) for detailed instructions.
```

---

## MDXコンポーネント使用

### カスタムコンポーネント

```mdx
# 記事タイトル

## Callout（注意書き）

<Callout type="info">
  これは情報メッセージです。
</Callout>

<Callout type="warning">
  これは警告メッセージです。
</Callout>

<Callout type="error">
  これはエラーメッセージです。
</Callout>

## Code Block（コードブロック）

```typescript
export function HelloWorld() {
  return <div>Hello World</div>
}
\```

## 画像

![画像の説明](/images/blog/example.jpg)

## リンク

[内部リンク](/about)
[外部リンク](https://example.com)
```

---

## コンテンツ記述ルール

### 見出し構造

```mdx
# H1: 記事タイトル（1つのみ）

## H2: セクションタイトル

### H3: サブセクション

#### H4: 詳細項目
```

### コードブロック

```mdx
## TypeScript

```typescript
export function example() {
  return "Hello World"
}
\```

## JavaScript

```javascript
function example() {
  return "Hello World"
}
\```

## Bash

```bash
npm install
npm run dev
\```
```

### リスト

```mdx
## 箇条書き

- Item 1
- Item 2
  - Nested Item 2.1
  - Nested Item 2.2
- Item 3

## 番号付きリスト

1. First step
2. Second step
3. Third step

## チェックリスト

- [x] Completed task
- [ ] Incomplete task
- [ ] Another task
```

### 表

```mdx
| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |
```

### 引用

```mdx
> これは引用文です。
> 複数行にわたることもできます。
```

---

## 画像管理

### 必須ルール

```mdx
# ✅ 推奨: /public/images配下の画像
![Dayopt Dashboard](/images/blog/dashboard.jpg)

# ❌ 禁止: 外部画像URL
![External Image](https://example.com/image.jpg)
```

### 画像配置規則

```
public/
├── images/
│   ├── blog/              # ブログ記事用画像
│   │   ├── post-1.jpg
│   │   └── post-2.jpg
│   ├── docs/              # ドキュメント用画像
│   │   ├── screenshot-1.jpg
│   │   └── diagram-1.svg
│   ├── releases/          # リリースノート用画像
│   │   ├── v1.0.0.jpg
│   │   └── v2.0.0.jpg
│   └── avatars/           # 著者アバター
│       ├── takeshi-yamada.jpg
│       └── yuki-tanaka.jpg
```

### 画像最適化

- **推奨フォーマット**: JPEG（写真）、PNG（スクリーンショット）、SVG（図表）
- **推奨サイズ**: 最大1200px幅
- **圧縮**: TinyPNG等で圧縮済み画像を使用
- **alt属性**: 必ず記述（アクセシビリティ・SEO）

---

## 多言語対応

### ファイル命名規則

```
content/
├── blog/
│   ├── en/              # 英語版
│   │   └── timeboxing-with-dayopt.mdx
│   └── ja/              # 日本語版
│       └── timeboxing-with-dayopt.mdx
├── docs/
│   ├── en/              # 英語版
│   │   └── features/plans.mdx
│   └── ja/              # 日本語版
│       └── features/plans.mdx
└── releases/
    ├── en/              # 英語版
    │   └── v0.16.0.mdx
    └── ja/              # 日本語版
        └── v0.16.0.mdx
```

ロケールはディレクトリで分離しており、frontmatter での `lang` 指定は不要。

---

## 禁止事項

### コンテンツ記述
- ❌ HTML直書き（`<div>`, `<span>`等）
- ❌ インラインスタイル（`style="..."`）
- ❌ 外部画像URL
- ❌ ハードコードされたリンク（多言語対応不可）

### 画像
- ❌ 1MB超え画像
- ❌ 圧縮されていない画像
- ❌ alt属性なし

### Frontmatter
- ❌ 必須フィールドの省略
- ❌ 不正な日付形式（ISO 8601形式必須）
- ❌ 空のタグ配列（`tags: []`は削除）

---

## 新規コンテンツ作成チェックリスト

### 基本項目
- [ ] Frontmatterはすべて記述したか？
- [ ] 日付はISO 8601形式か？（`YYYY-MM-DD`）
- [ ] タグは適切に設定したか？（3-6個推奨）
- [ ] カバー画像は`/public/images`配下か？
- [ ] すべての画像にalt属性を記述したか？
- [ ] 外部画像URLを使用していないか？
- [ ] 見出し構造は適切か？（H1は1つのみ）
- [ ] コードブロックに言語指定したか？
- [ ] リンクは正しく機能するか？
- [ ] 多言語対応は必要か？（必要な場合は両言語版を作成）

### AI/RAGメタデータ（簡略版）
- [ ] `tags` は設定したか？（RAGキーワードとして流用される）
- [ ] `description` は適切に記述したか？（AI要約として流用される）
- [ ] `ai.relatedQuestions` は設定したか？（3-5個推奨、**手動で記述**）
- [ ] `ai.chunkStrategy` は適切か？（通常 `h2`）
- [ ] `ai.searchable` は `true` か？
- [ ] `ai.difficulty` は適切か？（`beginner`/`intermediate`/`advanced`）
- [ ] `ai.contentType` は適切か？（`tutorial`/`reference`/`guide`等）

---

## MDXコンポーネントカタログ

### 利用可能なコンポーネント

```typescript
// components/docs/MDXComponents.tsx で定義済み
export const mdxComponents = {
  h1: H1,
  h2: H2,
  h3: H3,
  p: Paragraph,
  a: Link,
  code: Code,
  pre: Pre,
  img: Image,
  // ...
}
```

詳細は`/src/components/docs/MDXComponents.tsx`を参照

---

## 関連ドキュメント

- **上位**: `/src/CLAUDE.md` - 実装の基本
- **上位**: `/CLAUDE.md` - 意思決定プロトコル
- **参考**: `/src/lib/mdx.ts` - MDX処理ロジック
- **参考**: [MDX公式](https://mdxjs.com/)

---

**最終更新**: 2025年1月 | **バージョン**: v2.0
