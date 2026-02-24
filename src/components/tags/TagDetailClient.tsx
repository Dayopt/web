'use client';

import { ContentHeader } from '@/components/content/ContentHeader';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { PillSwitcher } from '@/components/ui/pill-switcher';
import { SearchInput } from '@/components/ui/search-input';
import { Heading } from '@/components/ui/typography';
import { Link } from '@/i18n/navigation';
import { getTagColor } from '@/lib/tags-client';
import type { TaggedContent } from '@/lib/tags-server';
import {
  ArrowLeft,
  BookOpen,
  FileText,
  Grid3X3,
  List,
  Megaphone,
  Search,
  TrendingUp,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

// 統一コンテンツアイテム（TaggedContentにhrefを追加）
interface UnifiedContentItem extends TaggedContent {
  href: string;
}

// アイコンを取得
function getContentIcon(type: TaggedContent['type']) {
  switch (type) {
    case 'blog':
      return <FileText className="size-5" />;
    case 'doc':
      return <BookOpen className="size-5" />;
    case 'release':
    default:
      return <Megaphone className="size-5" />;
  }
}

type ViewMode = 'list' | 'grid';

interface TagDetailClientProps {
  tag: string;
  blogContent: TaggedContent[];
  releaseContent: TaggedContent[];
  docsContent: TaggedContent[];
  popularTags: { tag: string; count: number }[];
  locale: string;
}

export function TagDetailClient({
  tag,
  blogContent,
  releaseContent,
  docsContent,
  popularTags,
  locale,
}: TagDetailClientProps) {
  const t = useTranslations('tags');
  const tDetail = useTranslations('tags.detail');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const totalCount = blogContent.length + releaseContent.length + docsContent.length;

  // フィルタリング
  const filterContent = <T extends TaggedContent>(items: T[]) => {
    if (!searchQuery) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(query) || item.description.toLowerCase().includes(query),
    );
  };

  const filteredBlog = filterContent(blogContent);
  const filteredReleases = filterContent(releaseContent);
  const filteredDocs = filterContent(docsContent);

  // 統一コンテンツリストを作成（blog + releases + docs を統合）
  const unifiedContent: UnifiedContentItem[] = [];

  filteredBlog.forEach((item) => {
    unifiedContent.push({ ...item, href: `/blog/${item.slug}` });
  });
  filteredReleases.forEach((item) => {
    unifiedContent.push({ ...item, href: `/releases/${item.slug}` });
  });
  filteredDocs.forEach((item) => {
    unifiedContent.push({ ...item, href: `/docs/${item.slug}` });
  });

  // 日付でソート（新しい順）
  unifiedContent.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const hasContent = unifiedContent.length > 0;
  const localeCode = locale === 'ja' ? 'ja-JP' : 'en-US';

  return (
    <div>
      <ContentHeader title={`#${tag}`} />

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-4">
        {/* 左サイドバー */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            {/* タグ情報 */}
            <div className="border-border bg-card rounded-2xl border p-6">
              <p className="text-muted-foreground mb-4 text-sm">
                {totalCount === 1
                  ? tDetail('itemsSingular', { count: totalCount })
                  : tDetail('items', { count: totalCount })}
              </p>
              <Link
                href="/tags"
                className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
              >
                <ArrowLeft className="size-4" />
                {tDetail('allTags')}
              </Link>
            </div>

            {/* 人気のタグ */}
            <div className="border-border bg-card rounded-2xl border p-6">
              <div className="mb-4 flex items-center gap-2">
                <TrendingUp className="text-muted-foreground size-4" />
                <h3 className="text-foreground text-sm font-bold">{t('popularTags')}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tagItem) => (
                  <Link
                    key={tagItem.tag}
                    href={`/tags/${encodeURIComponent(tagItem.tag)}`}
                    className={`inline-flex items-center rounded-lg px-2 py-1 text-xs font-bold transition-colors ${
                      tagItem.tag.toLowerCase() === tag.toLowerCase()
                        ? 'bg-foreground text-background'
                        : getTagColor(tagItem.tag)
                    }`}
                  >
                    #{tagItem.tag}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 右メイン */}
        <div className="lg:col-span-3">
          {/* 検索 + ビュー切り替え */}
          <div className="mb-6 flex items-center gap-4">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={tDetail('searchContent')}
              clearLabel={tDetail('clearSearch')}
              className="flex-1"
            />

            <PillSwitcher
              options={[
                {
                  value: 'list',
                  label: t('view.list'),
                  icon: <List className="size-4" />,
                },
                {
                  value: 'grid',
                  label: t('view.grid'),
                  icon: <Grid3X3 className="size-4" />,
                },
              ]}
              value={viewMode}
              onValueChange={setViewMode}
            />
          </div>

          {/* コンテンツ一覧 */}
          {hasContent ? (
            viewMode === 'list' ? (
              <div className="divide-border divide-y">
                {unifiedContent.map((item) => (
                  <article key={`${item.type}-${item.slug}`} className="group py-6 first:pt-0">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
                      {/* 日付 */}
                      <div className="text-muted-foreground w-28 flex-shrink-0 text-sm">
                        <time dateTime={item.date}>
                          {new Date(item.date).toLocaleDateString(localeCode, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </time>
                      </div>

                      {/* コンテンツタイプ */}
                      <div className="flex w-44 flex-shrink-0 flex-wrap items-center gap-2">
                        <span className="bg-muted text-muted-foreground inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold">
                          {item.type === 'blog' ? (
                            <FileText className="size-3" />
                          ) : item.type === 'doc' ? (
                            <BookOpen className="size-3" />
                          ) : (
                            <Megaphone className="size-3" />
                          )}
                          {t(
                            item.type === 'blog'
                              ? 'blog'
                              : item.type === 'doc'
                                ? 'docs'
                                : 'releases',
                          )}
                        </span>
                      </div>

                      {/* タイトル */}
                      <div className="min-w-0 flex-1">
                        <Link href={item.href} className="group/link">
                          <Heading
                            as="h2"
                            size="md"
                            className="text-foreground group-hover/link:text-primary font-bold transition-colors"
                          >
                            {item.title}
                          </Heading>
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {unifiedContent.map((item) => (
                  <Link key={`${item.type}-${item.slug}`} href={item.href} className="block">
                    <Card className="hover:bg-state-hover h-full transition-colors">
                      <CardHeader className="gap-2">
                        <div className="flex items-center gap-2">
                          <div className="bg-muted text-muted-foreground flex size-8 items-center justify-center rounded-lg">
                            {getContentIcon(item.type)}
                          </div>
                          <span className="text-muted-foreground text-xs">
                            {t(
                              item.type === 'blog'
                                ? 'blog'
                                : item.type === 'release'
                                  ? 'releases'
                                  : 'docs',
                            )}
                          </span>
                        </div>
                        <CardTitle className="line-clamp-2 text-base">{item.title}</CardTitle>
                        {item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {item.tags.slice(0, 3).map((tagName) => (
                              <span
                                key={tagName}
                                className={`inline-flex items-center rounded px-2 py-1 text-xs ${getTagColor(tagName)}`}
                              >
                                #{tagName}
                              </span>
                            ))}
                            {item.tags.length > 3 && (
                              <span className="text-muted-foreground text-xs">
                                +{item.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                        <p className="text-muted-foreground text-xs">
                          {new Date(item.date).toLocaleDateString(localeCode, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            )
          ) : (
            <EmptyState
              icon={Search}
              title={tDetail('noContentFound')}
              description={tDetail('noContentHint')}
              action={{
                label: tDetail('clearSearch'),
                onClick: () => setSearchQuery(''),
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
