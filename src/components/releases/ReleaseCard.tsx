'use client';

import { Heading } from '@/components/ui/typography';
import { Link } from '@/i18n/navigation';
import { getTagColor } from '@/lib/tags-client';
import { useTranslations } from 'next-intl';

// Local type definitions to avoid importing server-only lib
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

interface ReleaseCardProps {
  release: ReleasePostMeta;
  priority?: boolean;
  layout?: 'list' | 'vertical';
  locale?: string;
}

export function ReleaseCard({ release, layout = 'vertical', locale }: ReleaseCardProps) {
  const t = useTranslations('releases');
  const { frontMatter } = release;

  const formatDate = (dateString: string) => {
    const localeCode = locale === 'ja' ? 'ja-JP' : 'en-US';
    return new Date(dateString).toLocaleDateString(localeCode, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formattedDate = formatDate(frontMatter.date);

  // List layout
  if (layout === 'list') {
    return (
      <article className="group py-6 first:pt-0">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
          {/* 日付 */}
          <div className="text-muted-foreground w-28 flex-shrink-0 text-sm">
            <time dateTime={frontMatter.date}>{formattedDate}</time>
          </div>

          {/* バージョン */}
          <div className="flex w-44 flex-shrink-0 flex-wrap items-center gap-2">
            <span className="border-border bg-muted text-foreground inline-flex items-center rounded-lg border px-2 py-1 text-xs font-bold">
              v{frontMatter.version}
            </span>
          </div>

          {/* タイトル */}
          <div className="min-w-0 flex-1">
            <Link href={`/releases/${frontMatter.version}`} className="group/link">
              <Heading
                as="h2"
                size="md"
                className="text-foreground group-hover/link:text-primary font-bold transition-colors"
              >
                {frontMatter.title}
              </Heading>
            </Link>
          </div>
        </div>
      </article>
    );
  }

  // Grid layout
  return (
    <article className="group bg-card overflow-hidden rounded-2xl">
      <Link href={`/releases/${frontMatter.version}`} className="block">
        <div className="p-6">
          {/* Version + Date */}
          <div className="mb-4 flex items-center gap-2">
            <span className="border-border bg-muted text-foreground inline-flex items-center rounded-lg border px-2 py-1 text-sm font-bold">
              v{frontMatter.version}
            </span>
            <span className="text-muted-foreground text-xs">·</span>
            <span className="text-muted-foreground text-xs">
              <time dateTime={frontMatter.date}>{formattedDate}</time>
            </span>
            {frontMatter.breaking && (
              <>
                <span className="text-muted-foreground text-xs">·</span>
                <span className="text-destructive text-xs font-bold">{t('breaking')}</span>
              </>
            )}
          </div>

          {/* Title */}
          <Heading
            as="h2"
            size="xl"
            className="mb-4 line-clamp-2 cursor-pointer transition-colors hover:underline"
          >
            {frontMatter.title}
          </Heading>

          {/* Tags (max 3) */}
          {frontMatter.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {frontMatter.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className={`inline-flex items-center rounded-lg px-2 py-1 text-xs font-bold ${getTagColor(tag)}`}
                >
                  #{tag}
                </span>
              ))}
              {frontMatter.tags.length > 3 && (
                <span className="text-muted-foreground text-xs">
                  +{frontMatter.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}
