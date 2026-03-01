import { ClientSidebar } from '@/components/docs/ClientSidebar';
import { DocsHeader } from '@/components/docs/DocsHeader';
import { Footer } from '@/components/layout/Footer';
import { generateDocsNavigation } from '@/lib/navigation';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const navigation = generateDocsNavigation();

  return (
    <div className="bg-background flex h-screen flex-col overflow-hidden">
      {/* Docs専用ヘッダー（固定） */}
      <DocsHeader />

      {/* 3カラムレイアウト: Sidebar(240px) | Main(flex-1) | TOC(240px, xl以上) */}
      <div className="max-w-8xl mx-auto flex w-full flex-1 overflow-hidden">
        {/* Left Sidebar - Navigation (lg以上で表示) */}
        <aside className="bg-container hidden w-60 flex-shrink-0 overflow-y-auto lg:block">
          <div className="px-4 py-8">
            <ClientSidebar navigation={navigation} />
          </div>
        </aside>

        {/* Main Content + Footer */}
        <main id="main-content" role="main" className="min-w-0 flex-1 overflow-y-auto">
          {children}
          <Footer />
        </main>
      </div>
    </div>
  );
}
