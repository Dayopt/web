import { Container } from '@/components/ui/container';
import { getTranslations } from 'next-intl/server';

interface SolutionSectionProps {
  locale: string;
}

const stepKeys = ['plan', 'execute', 'reflect'] as const;

export async function SolutionSection({ locale }: SolutionSectionProps) {
  const t = await getTranslations({ locale, namespace: 'marketing' });

  return (
    <section id="solution" className="py-24">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
            {t('solution.title')}
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">{t('solution.subtitle')}</p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-12 md:grid-cols-3">
          {stepKeys.map((key) => (
            <div key={key} className="text-center">
              <div className="text-primary mx-auto mb-4 text-4xl font-bold">
                {t(`solution.steps.${key}.number`)}
              </div>
              <h3 className="text-foreground text-xl font-bold">
                {t(`solution.steps.${key}.title`)}
              </h3>
              <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                {t(`solution.steps.${key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
