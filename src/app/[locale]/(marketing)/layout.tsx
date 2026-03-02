import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';

interface MarketingLayoutProps {
  children: React.ReactNode;
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="main-content" role="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
