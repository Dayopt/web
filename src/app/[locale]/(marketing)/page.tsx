import { FeaturesSection } from '@/components/marketing/FeaturesSection';
import { PricingSection } from '@/components/marketing/PricingSection';
import { ProblemSection } from '@/components/marketing/ProblemSection';
import { SolutionSection } from '@/components/marketing/SolutionSection';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
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

// ISR: マーケティングページは1時間ごとに再検証
export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'marketing' });

  return generateSEOMetadata({
    title: t('hero.title'),
    description: t('hero.subtitle'),
    url: `/${locale}`,
    locale: locale,
    keywords:
      locale === 'ja'
        ? ['タイムボクシング', '時間管理', '生産性', '振り返り', 'カレンダー']
        : ['timeboxing', 'time management', 'productivity', 'reflection', 'calendar'],
    type: 'website',
  });
}

export default async function Home({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'marketing' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });

  return (
    <div className="bg-background">
      <div className="relative isolate">
        {/* Hero content */}
        <section className="py-24 sm:py-32 lg:pb-40">
          <Container>
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="text-foreground text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                {t('hero.title')}
              </h1>
              <p className="text-muted-foreground mt-6 text-lg sm:text-xl">{t('hero.subtitle')}</p>
              <div className="mt-12 flex items-center justify-center gap-x-6">
                <Button variant="primary" size="lg" asChild>
                  <Link href="/signup">{t('hero.cta')}</Link>
                </Button>
                <Button variant="ghost" size="lg" asChild>
                  <Link href="/#solution">
                    {tCommon('actions.learnMore')} <span aria-hidden="true">→</span>
                  </Link>
                </Button>
              </div>
            </div>

            {/* Screenshot */}
            <div className="mt-16 flow-root sm:mt-24">
              <div className="bg-muted ring-border -m-2 rounded-2xl p-2 ring-1 ring-inset lg:-m-4 lg:rounded-2xl lg:p-4">
                <div className="bg-muted ring-border relative aspect-[16/9] w-full rounded-lg shadow-2xl ring-1">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-muted-foreground text-sm">App Screenshot Placeholder</p>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Problem Section */}
        <ProblemSection locale={locale} />

        {/* Solution Section */}
        <SolutionSection locale={locale} />

        {/* Features Section */}
        <FeaturesSection locale={locale} />

        {/* Pricing Section */}
        <PricingSection locale={locale} />
      </div>
    </div>
  );
}
