'use client';

import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

// SNS Icons
const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5685 21H20.8131L13.6819 10.6218H13.6823ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.2995L11.5541 13.096V13.0956Z" />
  </svg>
);

const GitHubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path
      fillRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      clipRule="evenodd"
    />
  </svg>
);

const YouTubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path
      fillRule="evenodd"
      d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z"
      clipRule="evenodd"
    />
  </svg>
);

export function Footer() {
  const t = useTranslations();
  const tFooter = useTranslations('footer');

  const navigation = {
    product: [
      { name: t('common.navigation.features'), href: '/features' },
      { name: t('common.navigation.pricing'), href: '/#pricing' },
    ],
    resources: [
      { name: t('common.navigation.blog'), href: '/blog' },
      { name: t('common.navigation.docs'), href: '/docs' },
      { name: t('common.navigation.releases'), href: '/releases' },
    ],
    company: [
      { name: t('common.navigation.about'), href: '/about' },
      { name: t('common.navigation.contact'), href: '/contact' },
    ],
    legal: [
      { name: t('footer.legal.termsOfService'), href: '/legal/terms' },
      { name: t('footer.legal.privacyPolicy'), href: '/legal/privacy' },

      { name: t('footer.legal.security'), href: '/legal/security' },
      { name: t('footer.legal.tokushoho'), href: '/legal/tokushoho' },
      { name: t('footer.legal.ossCredits'), href: '/legal/oss-credits' },
    ],
  };

  const socialLinks = [
    {
      name: 'X',
      href: 'https://x.com/dayoptapp',
      icon: XIcon,
    },
    {
      name: 'GitHub',
      href: 'https://github.com/dayoptapp',
      icon: GitHubIcon,
    },
    {
      name: 'YouTube',
      href: 'https://youtube.com/@dayoptapp',
      icon: YouTubeIcon,
    },
  ];

  return (
    <footer className="bg-background border-border border-t">
      <div className="mx-auto max-w-7xl px-6 pt-12 pb-8 lg:px-8">
        {/* Navigation Grid */}
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Logo */}
          <div>
            <Link href="/" className="inline-block">
              <span className="text-foreground text-2xl font-bold">Dayopt</span>
            </Link>
          </div>

          {/* Links Grid */}
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              {/* Product */}
              <div>
                <h3 className="text-foreground text-base font-bold">
                  {tFooter('sections.product')}
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.product.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-muted-foreground hover:text-foreground text-sm transition-colors hover:underline"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Resources */}
              <div className="mt-12 md:mt-0">
                <h3 className="text-foreground text-base font-bold">
                  {tFooter('sections.resources')}
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.resources.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-muted-foreground hover:text-foreground text-sm transition-colors hover:underline"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              {/* Company */}
              <div>
                <h3 className="text-foreground text-base font-bold">
                  {tFooter('sections.company')}
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.company.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-muted-foreground hover:text-foreground text-sm transition-colors hover:underline"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Legal */}
              <div className="mt-12 md:mt-0">
                <h3 className="text-foreground text-base font-bold">{tFooter('sections.legal')}</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.legal.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-muted-foreground hover:text-foreground text-sm transition-colors hover:underline"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-border mt-12 border-t pt-8">
          {/* Mobile: SNS row + Copyright/Settings row */}
          <div className="space-y-6 md:hidden">
            {/* SNS icons */}
            <div className="flex items-center justify-center gap-x-6">
              {socialLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon aria-hidden="true" className="size-5" />
                </a>
              ))}
            </div>
            {/* Copyright left, Settings right */}
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                &copy; {new Date().getFullYear()} Dayopt, Inc.
              </p>
              <div className="flex items-center gap-x-0">
                <ThemeToggle />
                <LanguageSwitcher variant="full" />
              </div>
            </div>
          </div>

          {/* Desktop: SNS + Settings right, Copyright left */}
          <div className="hidden md:flex md:items-center md:justify-between">
            <p className="text-muted-foreground text-sm">
              &copy; {new Date().getFullYear()} Dayopt, Inc. {tFooter('legal.copyright')}
            </p>
            <div className="flex items-center gap-x-6">
              {socialLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon aria-hidden="true" className="size-5" />
                </a>
              ))}
              <div className="ml-4 flex items-center gap-x-0">
                <ThemeToggle />
                <LanguageSwitcher variant="full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
