import { Container } from '@/components/ui/container';
import { getTranslations } from 'next-intl/server';

interface MissionSectionProps {
  locale: string;
}

const valueKeys = ['simple', 'honest', 'private'] as const;

export async function MissionSection({ locale }: MissionSectionProps) {
  const t = await getTranslations({ locale, namespace: 'marketing' });

  return (
    <section id="mission" className="py-24">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
            {t('mission.title')}
          </h2>
          <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg leading-relaxed">
            {t('mission.description')}
          </p>
          <p className="text-muted-foreground mt-4 text-sm">{t('mission.builderNote')}</p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-12 md:grid-cols-3">
          {valueKeys.map((key) => (
            <div key={key} className="text-center">
              <h3 className="text-foreground text-xl font-bold">
                {t(`mission.values.${key}.title`)}
              </h3>
              <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                {t(`mission.values.${key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
