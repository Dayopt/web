'use client';

import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Link } from '@/i18n/navigation';
import { Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface DocsHeaderProps {
  onMobileMenuToggle?: () => void;
  mobileMenuOpen?: boolean;
}

export function DocsHeader({ onMobileMenuToggle, mobileMenuOpen }: DocsHeaderProps) {
  const t = useTranslations('common');

  return (
    <header className="bg-background border-border z-dropdown w-full flex-shrink-0 border-b">
      <nav
        className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 lg:px-6"
        aria-label={t('aria.docsNavigation')}
      >
        {/* Left: Mobile menu toggle + Logo */}
        <div className="flex items-center gap-4 lg:flex-1">
          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            icon
            onClick={onMobileMenuToggle}
            className="lg:hidden"
            aria-label={mobileMenuOpen ? t('aria.closeMenu') : t('aria.openMenu')}
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>

          {/* Logo → marketing home, Docs badge → docs home */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center">
              <span className="text-foreground text-lg font-bold">Dayopt</span>
            </Link>
            <Link
              href="/docs"
              className="bg-muted text-muted-foreground hover:text-foreground rounded px-2 py-1 text-xs font-bold transition-colors"
            >
              Docs
            </Link>
          </div>
        </div>

        {/* Center: Navigation (Desktop only) */}
        <div className="hidden lg:flex lg:items-center lg:gap-x-1">
          <Link
            href="/blog"
            className="text-muted-foreground hover:bg-state-hover hover:text-foreground rounded-lg px-4 py-2 text-base font-bold transition-colors"
          >
            {t('navigation.blog')}
          </Link>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-1 items-center justify-end gap-0">
          <ThemeToggle />
          <LanguageSwitcher />
          <Button variant="outline" size="default" asChild className="ml-2 hidden sm:inline-flex">
            <Link href="/login">{t('actions.login')}</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}
