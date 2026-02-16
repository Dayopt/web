# /src/lib/CLAUDE.md - 共通処理・ユーティリティ実装ガイド

## この文書の位置づけ

**レベル2**: 領域特化ルール（共通処理・ユーティリティ）

- 上位: `/src/CLAUDE.md`（実装の基本）
- 上位: `/CLAUDE.md`（意思決定プロトコル）

**役割**: 共通処理・ユーティリティの実装方法を定義

---

## 基本原則

### 1. Pure Function優先

- 副作用のない純粋関数を優先
- テスト可能性を重視

### 2. 型安全性

- 戻り値・引数の型を明示的に定義
- `any`型禁止

### 3. 既存ライブラリの活用

- 車輪の再発明を避ける
- date-fns, zod等の実績あるライブラリを活用

---

## lib/ディレクトリ構造

```
src/lib/
├── utils.ts              # 汎用ユーティリティ（cn関数等）
├── blog.ts               # ブログデータ取得
├── releases.ts           # リリースデータ取得
├── mdx.ts                # MDX処理
├── metadata.ts           # メタデータ生成
├── search.ts             # 検索ロジック
├── toc.ts                # 目次生成
├── tags-server.ts        # タグ処理（サーバー）
└── tags-client.ts        # タグ処理（クライアント）

# ※ 国際化（i18n）は src/i18n/ ディレクトリで管理
# 詳細は src/i18n/CLAUDE.md を参照
```

---

## 主要ユーティリティ実装パターン

### 1. cn関数（クラス名マージ）

```typescript
// lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Tailwindクラス名を結合・マージするユーティリティ
 * shadcn/ui標準のcn関数
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**使用例**:

```typescript
import { cn } from '@/lib/utils'

<div className={cn(
  'base-class',
  isActive && 'active-class',
  className
)}>
  Content
</div>
```

---

### 2. 国際化（next-intl）

next-intl を使用した国際化システム。翻訳は `messages/{locale}/*.json` に配置。

**設定ファイル**:

```typescript
// src/i18n/routing.ts
export const routing = defineRouting({
  locales: ['en', 'ja'],
  defaultLocale: 'en',
});

export type Locale = (typeof routing.locales)[number];
```

**Server Component での使用**:

```typescript
import { getTranslations } from 'next-intl/server'

export default async function Page() {
  const t = await getTranslations('common')
  return <h1>{t('navigation.home')}</h1>
}
```

**Client Component での使用**:

```typescript
'use client'

import { useTranslations } from 'next-intl'

export function MyComponent() {
  const t = useTranslations('common')
  return <h1>{t('navigation.home')}</h1>
}
```

**日付のローカライズ**:

```typescript
// Intl.DateTimeFormat を直接使用
const formatDate = (dateString: string, locale: string) => {
  const localeCode = locale === 'ja' ? 'ja-JP' : 'en-US';
  return new Date(dateString).toLocaleDateString(localeCode, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
```

---

### 3. MDXコンテンツ処理

```typescript
// lib/mdx.ts
import { readFileSync, readdirSync } from 'fs';
import path from 'path';
import matter from 'gray-matter';

/**
 * MDXファイルのFrontmatter型定義
 */
interface MdxFrontmatter {
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  coverImage?: string;
}

/**
 * MDXファイルを読み込み
 */
export function getMdxFile<T extends MdxFrontmatter>(
  dir: string,
  slug: string,
): { frontmatter: T; content: string } {
  const filePath = path.join(process.cwd(), dir, `${slug}.mdx`);
  const fileContent = readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContent);

  return {
    frontmatter: data as T,
    content,
  };
}

/**
 * ディレクトリ内のすべてのMDXファイルを取得
 */
export function getAllMdxFiles<T extends MdxFrontmatter>(dir: string): Array<T & { slug: string }> {
  const dirPath = path.join(process.cwd(), dir);
  const files = readdirSync(dirPath).filter((file) => file.endsWith('.mdx'));

  return files
    .map((file) => {
      const slug = file.replace(/\.mdx$/, '');
      const { frontmatter } = getMdxFile<T>(dir, slug);
      return { ...frontmatter, slug };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
```

**使用例**:

```typescript
import { getAllMdxFiles } from '@/lib/mdx';

export async function getAllPosts() {
  return getAllMdxFiles<PostFrontmatter>('content/blog');
}
```

---

### 4. メタデータ生成

```typescript
// lib/metadata.ts
import type { Metadata } from 'next';

/**
 * 基本メタデータ生成
 */
export function generateBasicMetadata({
  title,
  description,
  path,
  locale = 'en',
}: {
  title: string;
  description: string;
  path: string;
  locale?: 'en' | 'ja';
}): Metadata {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yoursaas.com';
  const fullUrl = `${siteUrl}/${locale}${path}`;

  return {
    title,
    description,
    alternates: {
      canonical: fullUrl,
      languages: {
        en: `${siteUrl}/en${path}`,
        ja: `${siteUrl}/jp${path}`,
      },
    },
    openGraph: {
      title,
      description,
      url: fullUrl,
      siteName: 'YourSaaS',
      locale: locale === 'ja' ? 'ja_JP' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

/**
 * ブログ記事用メタデータ生成
 */
export function generateBlogMetadata({
  title,
  excerpt,
  slug,
  date,
  coverImage,
  tags,
  locale = 'en',
}: {
  title: string;
  excerpt: string;
  slug: string;
  date: string;
  coverImage: string;
  tags: string[];
  locale?: 'en' | 'ja';
}): Metadata {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yoursaas.com';
  const fullUrl = `${siteUrl}/${locale}/blog/${slug}`;

  return {
    title,
    description: excerpt,
    alternates: {
      canonical: fullUrl,
      languages: {
        en: `${siteUrl}/en/blog/${slug}`,
        ja: `${siteUrl}/jp/blog/${slug}`,
      },
    },
    openGraph: {
      title,
      description: excerpt,
      url: fullUrl,
      siteName: 'YourSaaS',
      locale: locale === 'ja' ? 'ja_JP' : 'en_US',
      type: 'article',
      publishedTime: date,
      images: [
        {
          url: coverImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: excerpt,
      images: [coverImage],
    },
    keywords: tags,
  };
}
```

**使用例**:

```typescript
import { generateBlogMetadata } from '@/lib/metadata';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);
  return generateBlogMetadata({ ...post, locale: 'en' });
}
```

---

### 5. 検索ロジック

```typescript
// lib/search.ts
interface SearchableItem {
  id: string;
  title: string;
  content: string;
  tags: string[];
  type: 'blog' | 'release' | 'docs';
}

/**
 * 全文検索（簡易版）
 */
export function searchContent(items: SearchableItem[], query: string): SearchableItem[] {
  const normalizedQuery = query.toLowerCase().trim();

  if (!normalizedQuery) {
    return [];
  }

  return items.filter((item) => {
    const titleMatch = item.title.toLowerCase().includes(normalizedQuery);
    const contentMatch = item.content.toLowerCase().includes(normalizedQuery);
    const tagMatch = item.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery));

    return titleMatch || contentMatch || tagMatch;
  });
}

/**
 * タグフィルタリング
 */
export function filterByTags(
  items: SearchableItem[],
  tags: string[],
  logic: 'AND' | 'OR' = 'OR',
): SearchableItem[] {
  if (tags.length === 0) {
    return items;
  }

  if (logic === 'AND') {
    return items.filter((item) => tags.every((tag) => item.tags.includes(tag)));
  }

  return items.filter((item) => tags.some((tag) => item.tags.includes(tag)));
}
```

**使用例**:

```typescript
import { searchContent, filterByTags } from '@/lib/search';

const results = searchContent(allPosts, query);
const filtered = filterByTags(results, selectedTags, 'AND');
```

---

### 6. エラーハンドリング

```typescript
// lib/error-handler.ts
/**
 * カスタムエラークラス
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * エラーログ記録
 */
export function logError(error: Error, context?: Record<string, unknown>): void {
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    if (context) {
      console.error('Context:', context);
    }
  }

  // 本番環境では外部ログサービスに送信
  // 例: Sentry, DataDog等
}

/**
 * 安全なJSON解析
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    logError(error as Error, { json });
    return fallback;
  }
}
```

**使用例**:

```typescript
import { AppError, logError, safeJsonParse } from '@/lib/error-handler';

try {
  const data = safeJsonParse<MyData>(jsonString, defaultData);
} catch (error) {
  logError(error as Error, { context: 'データ取得中' });
  throw new AppError('データ取得に失敗しました', 'DATA_FETCH_ERROR', 500);
}
```

---

## 実装パターン別ガイド

### パターン1: データ取得（SSG対応）

```typescript
// lib/blog.ts
import { getAllMdxFiles, getMdxFile } from './mdx';

interface PostFrontmatter {
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  coverImage: string;
  category: string;
}

/**
 * すべてのブログ記事を取得（SSG用）
 */
export async function getAllPosts(): Promise<Array<PostFrontmatter & { slug: string }>> {
  return getAllMdxFiles<PostFrontmatter>('content/blog');
}

/**
 * スラッグから記事を取得
 */
export async function getPostBySlug(
  slug: string,
): Promise<PostFrontmatter & { slug: string; content: string }> {
  const { frontmatter, content } = getMdxFile<PostFrontmatter>('content/blog', slug);
  return { ...frontmatter, slug, content };
}

/**
 * カテゴリーでフィルタリング
 */
export async function getPostsByCategory(
  category: string,
): Promise<Array<PostFrontmatter & { slug: string }>> {
  const posts = await getAllPosts();
  return posts.filter((post) => post.category === category);
}

/**
 * タグでフィルタリング
 */
export async function getPostsByTag(
  tag: string,
): Promise<Array<PostFrontmatter & { slug: string }>> {
  const posts = await getAllPosts();
  return posts.filter((post) => post.tags.includes(tag));
}
```

---

### パターン2: バリデーション（Zod使用）

```typescript
// lib/validation.ts
import { z } from 'zod';

/**
 * お問い合わせフォームスキーマ
 */
export const contactFormSchema = z.object({
  name: z
    .string()
    .min(1, 'お名前を入力してください')
    .max(50, 'お名前は50文字以内で入力してください'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  subject: z
    .string()
    .min(1, '件名を入力してください')
    .max(100, '件名は100文字以内で入力してください'),
  message: z
    .string()
    .min(10, 'メッセージは10文字以上で入力してください')
    .max(1000, 'メッセージは1000文字以内で入力してください'),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

/**
 * メールアドレスバリデーション
 */
export function validateEmail(email: string): boolean {
  const emailSchema = z.string().email();
  return emailSchema.safeParse(email).success;
}

/**
 * URLバリデーション
 */
export function validateUrl(url: string): boolean {
  const urlSchema = z.string().url();
  return urlSchema.safeParse(url).success;
}
```

**使用例**:

```typescript
import { contactFormSchema } from '@/lib/validation';

export async function handleSubmit(formData: FormData) {
  const data = {
    name: formData.get('name'),
    email: formData.get('email'),
    subject: formData.get('subject'),
    message: formData.get('message'),
  };

  const result = contactFormSchema.safeParse(data);

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  // フォーム送信処理
}
```

---

### パターン3: 日付フォーマット（date-fns使用）

```typescript
// lib/date-utils.ts
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { ja, enUS } from 'date-fns/locale';

/**
 * 日付をフォーマット
 */
export function formatDate(
  date: string | Date,
  formatStr: string = 'PPP',
  locale: 'en' | 'ja' = 'en',
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const localeObj = locale === 'ja' ? ja : enUS;

  return format(dateObj, formatStr, { locale: localeObj });
}

/**
 * 相対時間表示（「3日前」等）
 */
export function formatRelativeTime(date: string | Date, locale: 'en' | 'ja' = 'en'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const localeObj = locale === 'ja' ? ja : enUS;

  return formatDistanceToNow(dateObj, { addSuffix: true, locale: localeObj });
}
```

**使用例**:

```typescript
import { formatDate, formatRelativeTime } from '@/lib/date-utils';

const publishedDate = formatDate(post.date, 'yyyy-MM-dd', 'ja');
const timeAgo = formatRelativeTime(post.date, 'ja');
```

---

## 禁止事項

### コード記述

- ❌ `any`型の使用
- ❌ グローバル変数の使用
- ❌ 副作用のある関数（可能な限り純粋関数に）
- ❌ ハードコードされた値（環境変数または定数ファイル使用）

### 判断

- ❌ 既存ライブラリで実現可能なのに独自実装
- ❌ エラーハンドリングの省略

---

## 実装前チェックリスト

- [ ] 型定義は明示的か？
- [ ] Pure Functionとして実装できるか？
- [ ] 既存ライブラリで代替できないか確認したか？
- [ ] エラーハンドリングを実装したか？
- [ ] テストを書いたか？
- [ ] JSDocコメントを追加したか？

---

## 関連ドキュメント

- **上位**: `/src/CLAUDE.md` - 実装の基本
- **上位**: `/CLAUDE.md` - 意思決定プロトコル
- **参考**: `/src/i18n/CLAUDE.md` - 国際化ガイド
- **参考**: [date-fns公式](https://date-fns.org/)
- **参考**: [Zod公式](https://zod.dev/)

---

**最終更新**: 2025年1月 | **バージョン**: v2.0
