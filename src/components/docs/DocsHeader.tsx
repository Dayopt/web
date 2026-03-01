'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Link } from '@/i18n/navigation';
import { ChevronDown, Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface DocsHeaderProps {
  onMobileMenuToggle?: () => void;
  mobileMenuOpen?: boolean;
}

export function DocsHeader({ onMobileMenuToggle, mobileMenuOpen }: DocsHeaderProps) {
  const t = useTranslations('common');

  const resourcesItems = [
    { name: t('navigation.blog'), href: '/blog', description: t('navigation.blogDescription') },
    { name: t('navigation.docs'), href: '/docs', description: t('navigation.docsDescription') },
    {
      name: t('navigation.releases'),
      href: '/releases',
      description: t('navigation.releasesDescription'),
    },
  ];

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

          {/* Logo with Docs badge */}
          <Link href="/docs" className="flex items-center gap-2">
            <span className="text-foreground text-lg font-bold">Dayopt</span>
            <span className="bg-muted text-muted-foreground rounded px-2 py-1 text-xs font-bold">
              Docs
            </span>
          </Link>
        </div>

        {/* Center: Navigation (Desktop only) */}
        <div className="hidden lg:flex lg:items-center lg:gap-x-1">
          <Link
            href="/"
            className="text-muted-foreground hover:bg-state-hover hover:text-foreground rounded-lg px-4 py-2 text-base font-bold transition-colors"
          >
            {t('navigation.home')}
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger className="text-muted-foreground hover:bg-state-hover hover:text-foreground flex items-center gap-x-1 rounded-lg px-4 py-2 text-base font-bold transition-colors outline-none">
              {t('navigation.resources')}
              <ChevronDown className="size-4" aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" sideOffset={8} className="w-56">
              {resourcesItems.map((item) => (
                <DropdownMenuItem key={item.name} asChild className="cursor-pointer">
                  <Link href={item.href}>
                    <div className="flex-auto">
                      <span className="text-foreground block font-bold">{item.name}</span>
                      <p className="text-muted-foreground text-xs">{item.description}</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-1 items-center justify-end gap-0">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Login Button */}
          <Button variant="outline" size="default" asChild className="ml-2 hidden sm:inline-flex">
            <Link href="/login">{t('actions.login')}</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}
