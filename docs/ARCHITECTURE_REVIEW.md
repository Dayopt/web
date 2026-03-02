# Dayopt Web — アーキテクチャ分析レビュー

> **作成日**: 2026-03-02
> **目的**: 現行アーキテクチャの評価と、ゼロから設計する場合の理想像分析

---

## 1. 現行アーキテクチャの評価

### 維持すべき強み

| 領域 | 評価 | 理由 |
|------|------|------|
| **Server Components優先** | 最善 | マーケティングサイトに理想的。`'use client'` 最小限の設計は正解 |
| **セキュリティ多層防御** | 堅牢 | CSP, HSTS, CSRF, Rate Limit — エンタープライズ水準 |
| **OKLCHカラー + セマンティックトークン** | 最先端 | Surface 4段階（background > overlay > container > card）は秀逸 |
| **next-intl i18n** | 適切 | `localePrefix: 'as-needed'` でSEOとUX両立 |
| **バンドル分割** | 良好 | vendor/ui/form/content/common の論理分割 + optimizePackageImports |
| **shadcn/ui + Radix UI** | 最善 | コンポーネントの所有権を保ちつつ高品質UIを実現 |

### コア技術選定の総合評価

Next.js 16 + Server Components + Tailwind CSS v4 + shadcn/ui + next-intl は、2026年時点でマーケティングサイトとして**最善の組み合わせ**。根本的な再設計の必要はない。

---

## 2. 改善提案

### 2.1 テスト戦略の導入（優先度: 高）

**現状**: テストフレームワーク未導入。品質ゲートは lint + type-check + build のみ。

**推奨する3層構成**:

```
E2E (少)       : Playwright — 多言語切替、検索、フォーム送信、テーマ切替
Integration    : Vitest — API routes, MDXパイプライン
Unit (多)      : Vitest — search.ts, blog.ts, metadata.ts, error-utils.ts
```

**推奨CI構成**:

```
Phase 1 (並列): lint, typecheck, vitest, validate-content
Phase 2 (依存): build
Phase 3 (依存): playwright e2e, lighthouse ci, bundle check
```

マーケティングサイトとしてはUnit Test + 3〜5個のE2Eで十分。

### 2.2 オブザーバビリティ: Sentry導入（優先度: 高）

**現状**: `src/lib/error-utils.ts` の `logError` に外部送信TODOが残っている。

**推奨**: `@sentry/nextjs` を導入し、既存の `logError` にSentry送信を追加。無料枠（5,000イベント/月）で十分。

### 2.3 コンテンツパイプラインの型安全化（優先度: 高）

**現状**: `blog.ts` で `data as BlogPostFrontMatter` のような型キャスト。

**推奨**: Zodスキーマでフロントマターをバリデーション。

```typescript
// content/config.ts
const blogSchema = z.object({
  title: z.string(),
  description: z.string(),
  publishedAt: z.string().datetime(),
  tags: z.array(z.string()),
  draft: z.boolean().default(false),
});
```

**対象**: `src/lib/blog.ts`, `src/lib/releases.ts`, `src/lib/mdx.ts`

Contentlayerは開発停滞中、Veliteは互換性不確実 → 自前Zodバリデーション層が最も現実的。

### 2.4 検索のビルド時インデックス化（優先度: 中）

**現状**: `api/search/route.ts` がリクエスト毎にMDX全件読み込み。

**推奨**: ビルド時にインデックスJSON生成 → CDN配信 → MiniSearch/Fuse.jsでクライアント検索。

API不要、CDNキャッシュ可能、レート制限不要。数百記事の規模まで十分高速。

### 2.5 モノレポ化（優先度: 低・長期検討）

**現状**: web と app は別リポジトリ。翻訳ファイル同期が手動。

**推奨構成**:

```
dayopt/
  apps/
    web/          # マーケティング
    app/          # SaaS
  packages/
    ui/           # 共通コンポーネント + Storybook
    i18n/         # 共通翻訳
    tokens/       # デザイントークン
  turbo.json
```

チーム規模が小さく翻訳同期が課題なら投資対効果が高い。

---

## 3. 変えなくてよいもの

- **tRPC**: APIルート2個にはオーバーエンジニアリング
- **状態管理ライブラリ**: グローバル共有すべき状態がない（useState で十分）
- **ESLint → Biome**: エコシステム成熟度でESLintが優位
- **ヘッドレスCMS**: ファイルシステムMDXはGit管理・型安全・無料。規模が小さいうちは最善
- **Next.js → Astro**: App Routerのストリーミング、ISR、多言語ルーティングの優位性

---

## 4. 実施優先順位

| 順位 | 施策 | コスト | 時期 |
|------|------|--------|------|
| 1 | Vitest + 基本E2E導入 | 1-2日 | 即時 |
| 2 | Sentry導入 | 半日 | 即時 |
| 3 | MDXフロントマターの Zod バリデーション | 1日 | 次スプリント |
| 4 | 検索ビルド時インデックス化 | 1-2日 | 次スプリント |
| 5 | モノレポ化 | 1週間 | 半年以内 |
| 6 | Storybook統合 | 2-3日 | モノレポ後 |

---

## 5. 結論

「ゼロから設計するなら」の答え：**ほぼ同じ設計にする。ただし初日からテスト・Sentry・Zodバリデーションを入れる。** モノレポ化は規模拡大に応じて判断する。
