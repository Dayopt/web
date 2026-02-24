import { FilteredTagsClient } from '@/components/tags/FilteredTagsClient';
import { Container } from '@/components/ui/container';
import { routing } from '@/i18n/routing';
import { generateSEOMetadata } from '@/lib/metadata';
import { getAllTags } from '@/lib/tags-server';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

interface TagsPageProps {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// ISR: タグ一覧は1時間ごとに再検証
export const revalidate = 3600;

export async function generateMetadata({ params }: TagsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'tags' });

  return generateSEOMetadata({
    title: t('title'),
    description: t('description'),
    url: `/${locale}/tags`,
    locale: locale,
    keywords:
      locale === 'ja'
        ? ['タグ', 'トピック', 'ブログ', 'ドキュメント', 'リリース', 'Dayopt']
        : ['tags', 'topics', 'blog', 'documentation', 'releases', 'Dayopt'],
    type: 'website',
  });
}

export default async function TagsPage({ params }: TagsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const allTags = await getAllTags();

  return (
    <div className="bg-background min-h-screen">
      <section className="py-16">
        <Container>
          <div className="mx-auto max-w-6xl">
            <FilteredTagsClient allTags={allTags} locale={locale} />
          </div>
        </Container>
      </section>
    </div>
  );
}
