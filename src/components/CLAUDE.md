# /src/components/CLAUDE.md - UIコンポーネント実装ガイド

## この文書の位置づけ

**レベル2**: 領域特化ルール（UIコンポーネント）

- 上位: `/src/CLAUDE.md`（実装の基本）
- 上位: `/CLAUDE.md`（意思決定プロトコル）

**役割**: UIコンポーネントの実装方法・パターンを定義

---

## コンポーネント開発の絶対的優先順位

### 第一選択: shadcn/ui

```bash
# shadcn/ui コンポーネント追加
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
```

```typescript
// ✅ 推奨: shadcn/ui使用
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'

export function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Title</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>Click me</Button>
      </CardContent>
    </Card>
  )
}
```

### 第二選択: shadcn/ui組み合わせ

```typescript
// ✅ 推奨: 複数のshadcn/uiコンポーネントを組み合わせて拡張
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function PostCard({ post }: PostCardProps) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <Badge variant="secondary">{post.category}</Badge>
        <Button variant="ghost" size="sm">Share</Button>
      </div>
    </Card>
  )
}
```

### 最後の手段: カスタム実装

```typescript
// ⚠️ 例外的に許可: shadcn/uiで対応できない場合のみ
// ただし、必ずセマンティックトークンを使用

export function CustomComponent() {
  return (
    <div className="bg-card text-card-foreground border-border rounded-[var(--radius)] p-4">
      {/* カスタム実装 */}
    </div>
  )
}
```

### ❌ 絶対禁止

```typescript
// ❌ ハードコードカラー
<div className="bg-blue-500 text-white">Content</div>
<div className="bg-neutral-900 text-neutral-100">Content</div>
<div className="bg-white dark:bg-gray-900">Content</div>

// ❌ 不透明度ベースホバー
<button className="bg-primary hover:bg-primary/90">...</button>
// → hover:bg-primary-hover を使用

// ❌ 禁止されたフォントウェイト
<span className="font-semibold">...</span>
<span className="font-medium">...</span>
// → font-bold / font-normal のみ

// ❌ 生のz-index / 非標準角丸
<div className="z-50 rounded-md">...</div>
// → z-modal, rounded-lg 等のセマンティック値を使用

// ❌ style属性
<div style={{ backgroundColor: '#3b82f6' }}>Content</div>
```

---

## コンポーネントディレクトリ構造

```
src/components/
├── ui/                      # shadcn/ui基盤コンポーネント（最優先）
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── badge.tsx
│   ├── alert.tsx
│   ├── sonner.tsx
│   └── ...
├── layout/                  # レイアウト関連
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Navigation.tsx
│   └── MobileMenu.tsx
├── blog/                    # ブログ関連
│   ├── PostCard.tsx
│   ├── PostHeader.tsx
│   ├── BlogFilters.tsx
│   ├── BlogPagination.tsx
│   └── ShareButton.tsx
├── docs/                    # ドキュメント関連
│   ├── MDXComponents.tsx
│   ├── TableOfContents.tsx
│   ├── Breadcrumbs.tsx
│   └── SearchDialog.tsx
├── releases/                # リリース関連
│   ├── ReleaseCard.tsx
│   ├── ReleaseFilter.tsx
│   └── ChangeTypeList.tsx
├── features/                # 機能紹介関連
│   ├── FeatureGrid.tsx
│   ├── FeatureDetails.tsx
│   └── FeaturesHero.tsx
├── seo/                     # SEO関連
│   ├── StructuredData.tsx
│   └── EnhancedSEO.tsx
├── analytics/               # 分析関連
│   ├── GoogleAnalytics.tsx
│   └── WebVitals.tsx
└── errors/                  # エラー関連
    └── ErrorLayout.tsx
```

---

## コンポーネント設計パターン

### パターン1: Server Component（デフォルト）

```typescript
// components/blog/PostCard.tsx
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface PostCardProps {
  post: {
    title: string
    slug: string
    excerpt: string
    coverImage: string
    category: string
    date: string
  }
  locale: 'en' | 'ja'
}

export function PostCard({ post, locale }: PostCardProps) {
  return (
    <Link href={`/${locale}/blog/${post.slug}`}>
      <Card className="hover:shadow-lg transition-shadow">
        <Image
          src={post.coverImage}
          alt={post.title}
          width={600}
          height={300}
          className="w-full h-48 object-cover"
        />
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary">{post.category}</Badge>
            <time className="text-sm text-muted-foreground">{post.date}</time>
          </div>
          <CardTitle>{post.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{post.excerpt}</p>
        </CardContent>
      </Card>
    </Link>
  )
}
```

### パターン2: Client Component（インタラクション必要時）

```typescript
// components/search/SearchDialog.tsx
'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useSearch } from '@/hooks/useSearch'

export function SearchDialog() {
  const [query, setQuery] = useState('')
  const { results, isLoading } = useSearch(query)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          Search
        </Button>
      </DialogTrigger>
      <DialogContent>
        <Input
          type="search"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {isLoading && <p>Loading...</p>}
        {results.map((result) => (
          <div key={result.id}>{result.title}</div>
        ))}
      </DialogContent>
    </Dialog>
  )
}
```

### パターン3: 遅延ロード（パフォーマンス最適化）

```typescript
// components/search/LazySearchDialog.tsx
import dynamic from 'next/dynamic'

const SearchDialog = dynamic(() => import('./SearchDialog').then(mod => ({ default: mod.SearchDialog })), {
  ssr: false,
  loading: () => <div className="h-10 w-32 animate-shimmer rounded-lg" />
})

export { SearchDialog }
```

### パターン4: 合成パターン（Compound Components）

```typescript
// components/blog/BlogFilters.tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface BlogFiltersProps {
  categories: string[]
  onCategoryChange: (category: string) => void
  onSearchChange: (query: string) => void
  onReset: () => void
}

export function BlogFilters({
  categories,
  onCategoryChange,
  onSearchChange,
  onReset
}: BlogFiltersProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <Input
        type="search"
        placeholder="Search posts..."
        onChange={(e) => onSearchChange(e.target.value)}
        className="flex-1"
      />
      <Select onValueChange={onCategoryChange}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button variant="outline" onClick={onReset}>
        Reset
      </Button>
    </div>
  )
}
```

---

## スタイリング実装例

### セマンティックトークンの使用

```typescript
// ✅ 推奨: セマンティックトークン
<Card className="bg-card text-card-foreground border-border">
  <CardHeader>
    <CardTitle className="text-primary">Title</CardTitle>
    <p className="text-muted-foreground">Subtitle</p>
  </CardHeader>
  <CardContent>
    <Button variant="primary">Click me</Button>
  </CardContent>
</Card>

// ✅ 推奨: Surface階層を意識
<div className="bg-background">           {/* ページ全体 */}
  <div className="bg-container p-6">      {/* セクション */}
    <div className="bg-card rounded-lg">  {/* カード */}
      Content
    </div>
  </div>
</div>

// ✅ 推奨: セマンティックカラー + ホバートークン
<div className="bg-destructive text-destructive-foreground">Error</div>
<div className="bg-success text-success">Success</div>
<button className="bg-primary hover:bg-primary-hover">送信</button>
<button className="text-primary hover:bg-primary-state-hover">Ghost</button>
```

### レスポンシブデザイン

```typescript
// ✅ 推奨: モバイルファースト + レスポンシブユーティリティ
<div className="p-responsive gap-responsive">
  <h1 className="text-responsive-3xl">Title</h1>
  <p className="text-responsive-base">Description</p>
</div>

// ✅ 推奨: ブレークポイント
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map((item) => (
    <Card key={item.id}>...</Card>
  ))}
</div>

// ✅ 推奨: 表示切り替え
<Button className="mobile-only">Menu</Button>
<nav className="desktop-only">...</nav>
```

### アクセシビリティ

```typescript
// ✅ 推奨: ARIA属性
<button
  aria-label="Close dialog"
  aria-expanded={isOpen}
  aria-controls="dialog-content"
>
  <X className="h-4 w-4" />
</button>

// ✅ 推奨: セマンティックHTML
<nav aria-label="Main navigation">
  <ul>
    <li><Link href="/about">About</Link></li>
  </ul>
</nav>

// ✅ 推奨: フォーカス管理（ring-ring トークン使用）
<Button
  className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
>
  Click me
</Button>

// ✅ 推奨: スクリーンリーダー対応
<span className="sr-only">Loading...</span>
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>
```

---

## 既存コンポーネント利用ガイド

### shadcn/ui基盤コンポーネント（常に最優先）

#### Button

```typescript
import { Button } from '@/components/ui/button'

<Button variant="primary">Primary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destructive</Button>
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
```

#### Card

```typescript
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    Content
  </CardContent>
  <CardFooter>
    Footer
  </CardFooter>
</Card>
```

#### Dialog

```typescript
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

<Dialog>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog description</DialogDescription>
    </DialogHeader>
    Content
  </DialogContent>
</Dialog>
```

#### Badge

```typescript
import { Badge } from '@/components/ui/badge'

<Badge variant="primary">Primary</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="info">Info</Badge>
<Badge variant="destructive">Destructive</Badge>
```

#### Alert

```typescript
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

<Alert>
  <AlertTitle>Alert Title</AlertTitle>
  <AlertDescription>Alert description</AlertDescription>
</Alert>

<Alert variant="destructive">
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Something went wrong</AlertDescription>
</Alert>
```

#### Toast (Sonner)

```typescript
import { toast } from 'sonner';

// Client Componentで使用
toast.success('Success message');
toast.error('Error message');
toast.info('Info message');
toast.warning('Warning message');
```

---

## よくある間違いと修正例

### ❌ 間違い: カラーコード直接指定

```typescript
<div className="bg-blue-500 text-white border-gray-300">
  Content
</div>
```

### ✅ 修正: セマンティックトークン使用

```typescript
<div className="bg-primary text-primary-foreground border-border">
  Content
</div>
```

---

### ❌ 間違い: カスタムボタン実装

```typescript
function CustomButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="bg-neutral-900 text-white px-4 py-2 rounded">
      {children}
    </button>
  )
}
```

### ✅ 修正: shadcn/ui Button使用

```typescript
import { Button } from '@/components/ui/button'

<Button variant="default">{children}</Button>
```

---

### ❌ 間違い: 不必要なClient Component

```typescript
'use client'

export function PostCard({ post }: PostCardProps) {
  return <article>...</article>  // インタラクションなし
}
```

### ✅ 修正: Server Component（デフォルト）

```typescript
// 'use client'を削除
export function PostCard({ post }: PostCardProps) {
  return <article>...</article>
}
```

---

### ❌ 間違い: デフォルトエクスポート

```typescript
export default function PostCard({ post }: PostCardProps) {
  return <article>...</article>
}
```

### ✅ 修正: 名前付きエクスポート

```typescript
export function PostCard({ post }: PostCardProps) {
  return <article>...</article>
}
```

---

## 実装前チェックリスト

- [ ] shadcn/uiで対応できないか確認したか？
- [ ] セマンティックトークンを使用しているか？
- [ ] Server Componentで実装可能か確認したか？
- [ ] 8pxグリッドシステムに従っているか？
- [ ] レスポンシブデザインに対応しているか？
- [ ] アクセシビリティ要件を満たしているか？
- [ ] 型定義は明示的か？（`any`型を使用していないか？）
- [ ] テストを書いたか？

---

## 関連ドキュメント

- **上位**: `/src/CLAUDE.md` - 実装の基本
- **上位**: `/CLAUDE.md` - 意思決定プロトコル
- **参考**: `docs/design-system/CLAUDE.md` - デザインシステム

---

**最終更新**: 2026年2月 | **バージョン**: v3.0
