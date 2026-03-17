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
    <section className="bg-muted py-20">
      <Container>
        <h2 className="text-foreground mx-auto max-w-3xl text-center text-3xl font-bold tracking-tight sm:text-4xl">
          {t('problem.title')}
        </h2>

        <div className="mx-auto mt-12 max-w-2xl space-y-8">
          {problemKeys.map((key) => {
            const Icon = problemIcons[key];
            return (
              <div key={key} className="flex items-start gap-4">
                <div className="bg-background mt-1 inline-flex size-10 shrink-0 items-center justify-center rounded-lg">
                  <Icon className="text-muted-foreground size-5" />
                </div>
                <div>
                  <h3 className="text-foreground text-base font-bold">
                    {t(`problem.items.${key}.title`)}
                  </h3>
                  <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                    {t(`problem.items.${key}.description`)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
