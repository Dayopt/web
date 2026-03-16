import { Container } from '@/components/ui/container';
import { CalendarX, Clock, Shuffle } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

interface ProblemSectionProps {
  locale: string;
}

const problemIcons = {
  separateApps: Shuffle,
  plansFallApart: CalendarX,
  noReview: Clock,
};

const problemKeys = ['separateApps', 'plansFallApart', 'noReview'] as const;

export async function ProblemSection({ locale }: ProblemSectionProps) {
  const t = await getTranslations({ locale, namespace: 'marketing' });

  return (
    <section className="bg-muted py-24">
      <Container>
        <h2 className="text-foreground mx-auto max-w-3xl text-center text-3xl font-bold tracking-tight sm:text-4xl">
          {t('problem.title')}
        </h2>

        <div className="mx-auto mt-16 grid max-w-5xl gap-12 md:grid-cols-3">
          {problemKeys.map((key) => {
            const Icon = problemIcons[key];
            return (
              <div key={key} className="text-center">
                <div className="bg-background mx-auto mb-6 inline-flex size-12 items-center justify-center rounded-lg">
                  <Icon className="text-muted-foreground size-6" />
                </div>
                <h3 className="text-foreground text-lg font-bold">
                  {t(`problem.items.${key}.title`)}
                </h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {t(`problem.items.${key}.description`)}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
