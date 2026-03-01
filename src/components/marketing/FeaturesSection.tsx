import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { BarChart3, Lock, Plug, Smartphone, Users, Zap } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

interface FeaturesSectionProps {
  locale: string;
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

export async function FeaturesSection({ locale }: FeaturesSectionProps) {
  const t = await getTranslations({ locale, namespace: 'marketing' });

  return (
    <section id="features" className="bg-muted py-24">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
            {t('features.grid.title')}
          </h2>
          <p className="text-muted-foreground mt-4 mb-16 text-lg">{t('features.grid.subtitle')}</p>
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
  );
}
