'use client';

import { ContentHeader } from '@/components/content/ContentHeader';
import { Button } from '@/components/ui/button';
import { ContentPagination } from '@/components/ui/content-pagination';
import { EmptyState } from '@/components/ui/empty-state';
import { MobileFilterSheet } from '@/components/ui/mobile-filter-sheet';
import { PillSwitcher } from '@/components/ui/pill-switcher';
import { SearchInput } from '@/components/ui/search-input';
import { Link } from '@/i18n/navigation';
import { getTagColor } from '@/lib/tags-client';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  FileText,
  Grid3X3,
  Hash,
  List,
  Megaphone,
  Search,
  TrendingUp,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

type ViewMode = 'list' | 'grid';
type CategoryFilter = 'all' | 'blog' | 'releases' | 'docs';

const TAGS_PER_PAGE = 30;

interface TagData {
  tag: string;
  count: number;
  blogCount: number;
  releaseCount: number;
  docsCount: number;
}

interface FilteredTagsClientProps {
  allTags: TagData[];
  locale: string;
}

export function FilteredTagsClient({ allTags, locale }: FilteredTagsClientProps) {
  const t = useTranslations('tags');
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const currentPage = Number(searchParams?.get('page')) || 1;

  // フィルタリング処理
  const filteredTags = allTags.filter((tag) => {
    if (searchQuery && !tag.tag.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (categoryFilter === 'blog' && tag.blogCount === 0) return false;
    if (categoryFilter === 'releases' && tag.releaseCount === 0) return false;
    if (categoryFilter === 'docs' && tag.docsCount === 0) return false;
    return true;
  });

  // ページネーション
  const totalPages = Math.ceil(filteredTags.length / TAGS_PER_PAGE);
  const startIndex = (currentPage - 1) * TAGS_PER_PAGE;
  const currentTags = filteredTags.slice(startIndex, startIndex + TAGS_PER_PAGE);

  const popularTags = allTags.slice(0, 10);

  const categoryOptions: { value: CategoryFilter; label: string; icon: React.ReactNode }[] = [
    { value: 'all', label: t('all'), icon: null },
    { value: 'blog', label: t('blog'), icon: <FileText className="size-3" /> },
    { value: 'releases', label: t('releases'), icon: <Megaphone className="size-3" /> },
    { value: 'docs', label: t('docs'), icon: <BookOpen className="size-3" /> },
  ];

  const activeFiltersCount = (searchQuery ? 1 : 0) + (categoryFilter !== 'all' ? 1 : 0);

  const clearAllFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
  };

  // サイドバーのフィルターUI（デスクトップ・モバイル共有）
  const filterContent = (
    <>
      {/* カテゴリフィルター */}
      <div>
        <span className="text-muted-foreground mb-4 block text-sm font-bold">{t('category')}</span>
        <div className="space-y-2">
          {categoryOptions.map((option) => (
            <Button
              key={option.value}
              onClick={() => setCategoryFilter(option.value)}
              variant="ghost"
              size="sm"
              className={cn(
                'w-full justify-start gap-2',
                categoryFilter === option.value && 'bg-muted text-foreground',
              )}
            >
              {option.icon}
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* 人気のタグ */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="text-muted-foreground size-4" />
          <span className="text-muted-foreground text-sm font-bold">{t('popularTags')}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {popularTags.map((tag) => (
            <Link
              key={tag.tag}
              href={`/tags/${encodeURIComponent(tag.tag)}`}
              className={`inline-flex items-center rounded-lg px-2 py-1 text-xs font-bold transition-colors ${getTagColor(tag.tag)}`}
            >
              #{tag.tag}
            </Link>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <div>
      <ContentHeader title={t('title')} />

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-4">
        {/* 左サイドバー */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-8">
            {/* デスクトップフィルター */}
            <div className="hidden space-y-8 lg:block">{filterContent}</div>

            {/* モバイルフィルター */}
            <MobileFilterSheet
              isOpen={isMobileOpen}
              onOpenChange={setIsMobileOpen}
              activeFilterCount={activeFiltersCount}
              onClear={clearAllFilters}
              onApply={() => {}}
              title={t('filters')}
              clearLabel={t('filtersClearAll')}
              applyLabel={t('filtersApply')}
              triggerLabel={t('filters')}
            >
              {filterContent}
            </MobileFilterSheet>
          </div>
        </div>

        {/* 右側: タグ一覧 */}
        <div className="lg:col-span-3">
          {/* 検索ボックス + ビュー切り替え */}
          <div className="mb-8 flex items-center gap-4">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={t('searchPlaceholder')}
              clearLabel={t('clearSearch')}
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

          {/* 結果件数 */}
          <div className="text-muted-foreground mb-6 text-sm" aria-live="polite">
            {filteredTags.length === 1
              ? t('tagsCountSingular', { count: filteredTags.length })
              : t('tagsCount', { count: filteredTags.length })}
            {categoryFilter !== 'all' && <span className="ml-2">({t(categoryFilter)})</span>}
          </div>

          {currentTags.length > 0 ? (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {currentTags.map((tag) => (
                    <Link
                      key={tag.tag}
                      href={`/tags/${encodeURIComponent(tag.tag)}`}
                      className={`group flex items-center justify-between rounded-lg border px-4 py-4 transition-all ${getTagColor(tag.tag)}`}
                    >
                      <div className="flex items-center gap-2">
                        <Hash className="size-4" />
                        <span className="font-bold">{tag.tag}</span>
                      </div>
                      <span className="text-sm opacity-75">{tag.count}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="divide-border divide-y">
                  {currentTags.map((tag) => (
                    <Link
                      key={tag.tag}
                      href={`/tags/${encodeURIComponent(tag.tag)}`}
                      className="group hover:bg-state-hover flex items-center justify-between py-4 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex size-10 items-center justify-center rounded-lg ${getTagColor(tag.tag)}`}
                        >
                          <Hash className="size-5" />
                        </div>
                        <div>
                          <div className="text-foreground font-bold">#{tag.tag}</div>
                          <div className="text-muted-foreground flex items-center gap-4 text-sm">
                            {tag.blogCount > 0 && (
                              <span className="flex items-center gap-1">
                                <FileText className="size-3" />
                                {tag.blogCount}
                              </span>
                            )}
                            {tag.releaseCount > 0 && (
                              <span className="flex items-center gap-1">
                                <Megaphone className="size-3" />
                                {tag.releaseCount}
                              </span>
                            )}
                            {tag.docsCount > 0 && (
                              <span className="flex items-center gap-1">
                                <BookOpen className="size-3" />
                                {tag.docsCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="bg-muted text-foreground flex size-8 items-center justify-center rounded-lg text-sm font-bold">
                        {tag.count}
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* ページネーション */}
              {totalPages > 1 && (
                <div className="mt-12">
                  <ContentPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    basePath={locale === 'ja' ? '/ja/tags' : '/tags'}
                  />
                </div>
              )}
            </>
          ) : (
            <EmptyState
              icon={Search}
              title={t('noTagsFound')}
              description={t('noTagsHint')}
              action={{
                label: t('clearFilters'),
                onClick: clearAllFilters,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
