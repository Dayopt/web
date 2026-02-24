'use client';

import { ContentHeader } from '@/components/content/ContentHeader';
import { ContentPagination } from '@/components/ui/content-pagination';
import { EmptyState } from '@/components/ui/empty-state';
import { PillSwitcher } from '@/components/ui/pill-switcher';
import { SearchInput } from '@/components/ui/search-input';
import { FileText, Grid3X3, List, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { ReleaseCard } from './ReleaseCard';
import { ReleaseFilter } from './ReleaseFilter';

// Define types locally to avoid importing from server-only lib
interface ReleaseFrontMatter {
  version: string;
  date: string;
  title: string;
  description: string;
  tags: string[];
  breaking: boolean;
  featured: boolean;
  prerelease?: boolean;
  author?: string;
  authorAvatar?: string;
  coverImage?: string;
}

interface ReleasePostMeta {
  frontMatter: ReleaseFrontMatter;
  slug: string;
  readingTime: number;
}

interface TagCount {
  tag: string;
  count: number;
}

type ViewMode = 'list' | 'grid';

const RELEASES_PER_PAGE = 12;

interface ReleasesClientProps {
  initialReleases: ReleasePostMeta[];
  initialTags: TagCount[];
  locale: string;
}

export function ReleasesClient({ initialReleases, initialTags, locale }: ReleasesClientProps) {
  const t = useTranslations('releases');
  const searchParams = useSearchParams();

  // フィルター状態
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const currentPage = Number(searchParams?.get('page')) || 1;

  // フィルター関数
  const filteredReleases = useMemo(() => {
    return initialReleases.filter((release) => {
      // 検索クエリフィルター
      if (searchQuery) {
        const searchTerm = searchQuery.toLowerCase();
        const titleMatch = release.frontMatter.title.toLowerCase().includes(searchTerm);
        const descriptionMatch = release.frontMatter.description
          ?.toLowerCase()
          .includes(searchTerm);
        const versionMatch = release.frontMatter.version.toLowerCase().includes(searchTerm);
        const tagMatch = release.frontMatter.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm),
        );

        if (!titleMatch && !descriptionMatch && !versionMatch && !tagMatch) {
          return false;
        }
      }

      // タグフィルター
      if (
        selectedTags.length > 0 &&
        !selectedTags.some((tag) => release.frontMatter.tags.includes(tag))
      ) {
        return false;
      }

      return true;
    });
  }, [initialReleases, selectedTags, searchQuery]);

  // ページネーション
  const totalReleases = filteredReleases.length;
  const totalPages = Math.ceil(totalReleases / RELEASES_PER_PAGE);
  const startIndex = (currentPage - 1) * RELEASES_PER_PAGE;
  const currentReleases = filteredReleases.slice(startIndex, startIndex + RELEASES_PER_PAGE);

  // フィルターハンドラー
  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleClearFilters = () => {
    setSelectedTags([]);
    setSearchQuery('');
  };

  return (
    <div>
      <ContentHeader title={t('header.title')} />

      {/* 2カラム: フィルター | リスト */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-4">
        {/* 左サイドバー: フィルター */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <ReleaseFilter
              tags={initialTags}
              selectedTags={selectedTags}
              onTagToggle={handleTagToggle}
              onClearFilters={handleClearFilters}
            />
          </div>
        </div>

        {/* 右側: リリース一覧 */}
        <div className="lg:col-span-3">
          {/* 検索ボックス + ビュー切り替え */}
          <div className="mb-8 flex items-center gap-4">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={t('filters.searchPlaceholder')}
              clearLabel={t('filters.clearSearch')}
              className="flex-1"
            />

            <PillSwitcher
              options={[
                { value: 'list', label: t('view.list'), icon: <List className="size-4" /> },
                { value: 'grid', label: t('view.grid'), icon: <Grid3X3 className="size-4" /> },
              ]}
              value={viewMode}
              onValueChange={setViewMode}
            />
          </div>

          {/* 結果件数 */}
          <div className="text-muted-foreground mb-6 text-sm" aria-live="polite">
            {t('filters.resultsFound', {
              count: totalReleases,
              total: initialReleases.length,
            })}
          </div>

          {currentReleases.length > 0 ? (
            <>
              {viewMode === 'list' ? (
                <div className="divide-border divide-y">
                  {currentReleases.map((release, index) => (
                    <ReleaseCard
                      key={release.frontMatter.version}
                      release={release}
                      priority={currentPage === 1 && index < 3}
                      layout="list"
                      locale={locale}
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {currentReleases.map((release, index) => (
                    <ReleaseCard
                      key={release.frontMatter.version}
                      release={release}
                      priority={currentPage === 1 && index < 3}
                      layout="vertical"
                      locale={locale}
                    />
                  ))}
                </div>
              )}

              {/* ページネーション */}
              {totalPages > 1 && (
                <div className="mt-12">
                  <ContentPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    basePath={locale === 'ja' ? '/ja/releases' : '/releases'}
                  />
                </div>
              )}
            </>
          ) : initialReleases.length === 0 ? (
            <EmptyState
              icon={FileText}
              title={t('emptyState.title')}
              description={t('emptyState.description')}
            />
          ) : (
            <EmptyState
              icon={Search}
              title={t('noResults.title')}
              description={t('noResults.description')}
              action={{
                label: t('noResults.clearFilters'),
                onClick: handleClearFilters,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
