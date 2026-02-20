import { Heading, Text } from '@/components/ui/typography';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { generateSEOMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// ISR: ドキュメントは1日ごとに再検証
export const revalidate = 86400;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'common' });

  return generateSEOMetadata({
    title: t('navigation.docs'),
    description: t('navigation.docsDescription'),
    url: `/${locale}/docs`,
    locale: locale,
    keywords:
      locale === 'ja'
        ? ['ドキュメント', 'API', 'ガイド', 'チュートリアル', 'SaaS', '開発']
        : ['documentation', 'API', 'guides', 'tutorials', 'SaaS', 'development'],
    type: 'website',
  });
}

export default async function DocsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const tCommon = await getTranslations({ locale, namespace: 'common' });
  const tDocs = await getTranslations({ locale, namespace: 'docs' });

  return (
    <div className="space-y-12 px-6 py-8 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-12">
        {/* Header Section */}
        <div className="space-y-4">
          <Heading as="h1" size="4xl" className="text-foreground">
            {tCommon('navigation.docs')}
          </Heading>
          <Text size="xl" variant="muted" className="max-w-3xl">
            {tDocs('landing.subtitle')}
          </Text>
        </div>

        {/* Quick Start Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="border-border bg-card hover:border-foreground rounded-lg border p-6 transition-colors">
            <div className="mb-4 flex items-center space-x-4">
              <div className="bg-muted flex size-10 items-center justify-center rounded-lg">
                <svg
                  className="text-primary size-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <Heading as="h3" size="lg">
                {tDocs('landing.quickStart.title')}
              </Heading>
            </div>
            <Text variant="muted" className="mb-4">
              {tDocs('landing.quickStart.description')}
            </Text>
            <Link href="/docs/quick-start" className="text-primary hover:text-primary/80 font-bold">
              {tDocs('landing.quickStart.link')}
            </Link>
          </div>

          <div className="border-border bg-card hover:border-foreground rounded-lg border p-6 transition-colors">
            <div className="mb-4 flex items-center space-x-4">
              <div className="bg-muted flex size-10 items-center justify-center rounded-lg">
                <svg
                  className="text-success size-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
              </div>
              <Heading as="h3" size="lg">
                {tDocs('landing.apiReference.title')}
              </Heading>
            </div>
            <Text variant="muted" className="mb-4">
              {tDocs('landing.apiReference.description')}
            </Text>
            <Link href="/docs/api" className="text-primary hover:text-primary/80 font-bold">
              {tDocs('landing.apiReference.link')}
            </Link>
          </div>

          <div className="border-border bg-card hover:border-foreground rounded-lg border p-6 transition-colors">
            <div className="mb-4 flex items-center space-x-4">
              <div className="bg-muted flex size-10 items-center justify-center rounded-lg">
                <svg
                  className="text-info size-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <Heading as="h3" size="lg">
                {tDocs('landing.guides.title')}
              </Heading>
            </div>
            <Text variant="muted" className="mb-4">
              {tDocs('landing.guides.description')}
            </Text>
            <Link href="/docs/guides" className="text-primary hover:text-primary/80 font-bold">
              {tDocs('landing.guides.link')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
