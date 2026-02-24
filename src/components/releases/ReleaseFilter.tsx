'use client';

import { Button } from '@/components/ui/button';
import { InlineTagFilter } from '@/components/ui/inline-tag-filter';
import { MobileFilterSheet } from '@/components/ui/mobile-filter-sheet';
import { cn } from '@/lib/utils';
import { Filter } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

interface TagCount {
  tag: string;
  count: number;
}

interface ReleaseFilterProps {
  tags: TagCount[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  onClearFilters: () => void;
}

export function ReleaseFilter({
  tags,
  selectedTags,
  onTagToggle,
  onClearFilters,
}: ReleaseFilterProps) {
  const t = useTranslations('releases.filters');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const activeFiltersCount = selectedTags.length;

  // フィルターUI（デスクトップ・モバイル共有）
  const filterContent = (
    <>
      {tags.length > 0 && (
        <InlineTagFilter
          tags={tags}
          selectedTags={selectedTags}
          onToggle={onTagToggle}
          onClear={onClearFilters}
          label={t('tags')}
          showMoreLabel={t('showMore')}
          showLessLabel={t('showLess')}
        />
      )}
    </>
  );

  return (
    <>
      {/* デスクトップ版 */}
      <div className={cn('border-border bg-background hidden rounded-2xl border lg:block')}>
        {/* フィルターヘッダー */}
        <div className="border-border border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="text-muted-foreground size-5" />
              <h3 className="text-foreground font-bold">{t('title')}</h3>
              {activeFiltersCount > 0 && (
                <span className="bg-muted text-primary border-primary rounded-full border px-2 py-1 text-xs font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </div>

            {activeFiltersCount > 0 && (
              <Button
                onClick={onClearFilters}
                variant="ghost"
                size="sm"
                className="h-auto p-1 text-xs"
              >
                {t('clearAll')}
              </Button>
            )}
          </div>
        </div>

        {/* フィルター内容 */}
        <div className="space-y-6 p-4">{filterContent}</div>
      </div>

      {/* モバイル版フィルター */}
      <MobileFilterSheet
        isOpen={isMobileOpen}
        onOpenChange={setIsMobileOpen}
        activeFilterCount={activeFiltersCount}
        onClear={onClearFilters}
        onApply={() => {}}
        title={t('title')}
        clearLabel={t('clearAll')}
        applyLabel={t('clearAll')}
        triggerLabel={t('title')}
      >
        {filterContent}
      </MobileFilterSheet>
    </>
  );
}
