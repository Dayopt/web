import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Heading, Text } from '@/components/ui/typography';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { generateSEOMetadata } from '@/lib/metadata';
import { BarChart3, Lock, Plug, Smartphone, Users, Zap } from 'lucide-react';
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
    title: t('features.title'),
    description: t('features.subtitle'),
    url: `/${locale}/features`,
    locale: locale,
    keywords:
      locale === 'ja'
        ? [
            '機能',
            'API統合',
            'リアルタイム分析',
            'セキュリティ',
            'ワークフロー自動化',
            'チームコラボレーション',
          ]
        : [
            'features',
            'API integration',
            'real-time analytics',
            'security',
            'workflow automation',
            'team collaboration',
          ],
    type: 'website',
  });
}

const featureIcons = {
  apiIntegration: Plug,
  realTimeAnalytics: BarChart3,
  advancedSecurity: Lock,
  workflowAutomation: Zap,
  teamCollaboration: Users,
  mobileOptimized: Smartphone,
};

const featureKeys = [
  'apiIntegration',
  'realTimeAnalytics',
  'advancedSecurity',
  'workflowAutomation',
  'teamCollaboration',
  'mobileOptimized',
] as const;

export default async function FeaturesPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'marketing' });

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="py-24">
        <Container>
          <div className="mx-auto max-w-4xl text-center">
            <div className="bg-muted text-primary mb-6 inline-block rounded-full px-4 py-2 text-sm font-bold">
              {t('features.badge')}
            </div>
            <Heading as="h1" size="4xl" className="mb-6">
              {t('features.headline')}
            </Heading>
            <Text size="xl" variant="muted" className="mx-auto mb-12 max-w-2xl">
              {t('features.description')}
            </Text>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/contact">{t('features.startTrial')}</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/contact">{t('features.scheduleDemo')}</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Features Grid */}
      <section className="bg-muted py-24">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <Heading as="h2" size="3xl" className="mb-4">
              {t('features.grid.title')}
            </Heading>
            <Text size="lg" variant="muted" className="mb-16">
              {t('features.grid.subtitle')}
            </Text>
          </div>

          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featureKeys.map((key) => {
              const Icon = featureIcons[key];
              return (
                <Card
                  key={key}
                  className="border-border bg-background transition-shadow hover:shadow-lg"
                >
                  <CardHeader>
                    <div className="bg-muted mb-4 inline-flex size-12 items-center justify-center rounded-lg">
                      <Icon className="text-primary size-6" />
                    </div>
                    <CardTitle className="text-xl">{t(`features.items.${key}.title`)}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      {t(`features.items.${key}.description`)}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <Container>
          <div className="bg-primary mx-auto max-w-4xl rounded-2xl px-8 py-16 text-center">
            <Heading as="h2" size="3xl" className="text-primary-foreground mb-4">
              {t('features.headline')}
            </Heading>
            <Text size="lg" className="text-primary-foreground/80 mx-auto mb-8 max-w-2xl">
              {t('features.description')}
            </Text>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/20 text-primary bg-background hover:bg-state-hover"
                asChild
              >
                <Link href="/signup">{t('features.startTrial')}</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-state-hover"
                asChild
              >
                <Link href="/#pricing">{t('features.scheduleDemo')}</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
