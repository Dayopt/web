import { ReleaseCard } from '@/components/releases/ReleaseCard';
import { ReleaseHeader } from '@/components/releases/ReleaseHeader';
import { Container } from '@/components/ui/container';
import { changeTypes, getAllReleaseMetas, getRelatedReleases, getRelease } from '@/lib/releases';
import type { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ComponentPropsWithoutRef } from 'react';

type HeadingProps = ComponentPropsWithoutRef<'h1'>;
type ParagraphProps = ComponentPropsWithoutRef<'p'>;
type AnchorProps = ComponentPropsWithoutRef<'a'> & { href?: string };
type BlockquoteProps = ComponentPropsWithoutRef<'blockquote'>;
type CodeProps = ComponentPropsWithoutRef<'code'>;
type PreProps = ComponentPropsWithoutRef<'pre'>;
type ListProps = ComponentPropsWithoutRef<'ul'>;
type OrderedListProps = ComponentPropsWithoutRef<'ol'>;
type ListItemProps = ComponentPropsWithoutRef<'li'>;
type ImageProps = ComponentPropsWithoutRef<'img'> & { src?: string; alt?: string };
type TableProps = ComponentPropsWithoutRef<'table'>;
type ThProps = ComponentPropsWithoutRef<'th'>;
type TdProps = ComponentPropsWithoutRef<'td'>;

interface ReleasePageProps {
  params: Promise<{
    locale: string;
    version: string;
  }>;
}

// Generate metadata
export async function generateMetadata({ params }: ReleasePageProps): Promise<Metadata> {
  const { locale, version } = await params;
  const release = await getRelease(version, locale);

  if (!release) {
    return {
      title: 'Release not found',
    };
  }

  const { frontMatter } = release;
  const releaseDate = new Date(frontMatter.date).toISOString();

  return {
    title: `${frontMatter.title} - v${frontMatter.version}`,
    description: frontMatter.description,
    keywords: frontMatter.tags.join(', '),
    authors: frontMatter.author ? [{ name: frontMatter.author }] : undefined,
    openGraph: {
      title: `${frontMatter.title} - v${frontMatter.version}`,
      description: frontMatter.description,
      type: 'article',
      publishedTime: releaseDate,
      authors: frontMatter.author ? [frontMatter.author] : undefined,
      tags: frontMatter.tags,
      images: frontMatter.coverImage
        ? [
            {
              url: frontMatter.coverImage,
              width: 1200,
              height: 630,
              alt: frontMatter.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${frontMatter.title} - v${frontMatter.version}`,
      description: frontMatter.description,
      images: frontMatter.coverImage ? [frontMatter.coverImage] : undefined,
    },
    alternates: {
      canonical: `/releases/${version}`,
    },
  };
}

// ISR: リリースノートは1日ごとに再検証
export const revalidate = 86400;

// Generate static paths
export async function generateStaticParams() {
  const locales = ['en', 'ja'];
  const params = [];

  for (const locale of locales) {
    const releases = await getAllReleaseMetas(locale);
    for (const release of releases) {
      params.push({ locale, version: release.frontMatter.version });
    }
  }

  return params;
}

// MDX Components
const mdxComponents = {
  h1: (props: HeadingProps) => (
    <h1 className="text-foreground mt-8 mb-4 text-3xl font-bold first:mt-0" {...props} />
  ),
  h2: (props: HeadingProps) => (
    <h2
      className="border-border text-foreground mt-8 mb-4 border-b pb-2 text-2xl font-bold"
      {...props}
    />
  ),
  h3: (props: HeadingProps) => (
    <h3 className="text-foreground mt-6 mb-4 text-xl font-bold" {...props} />
  ),
  h4: (props: HeadingProps) => (
    <h4 className="text-foreground mt-6 mb-4 text-lg font-bold" {...props} />
  ),
  p: (props: ParagraphProps) => <p className="text-foreground mb-4 leading-relaxed" {...props} />,
  a: (props: AnchorProps) => (
    <a
      className="text-primary hover:text-primary/80 underline underline-offset-2"
      target={props.href?.startsWith('http') ? '_blank' : undefined}
      rel={props.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      {...props}
    />
  ),
  blockquote: (props: BlockquoteProps) => (
    <blockquote
      className="border-info bg-muted text-foreground my-6 rounded-r-lg border-l-4 py-2 pl-4 italic"
      {...props}
    />
  ),
  code: (props: CodeProps) => (
    <code className="bg-muted text-foreground rounded px-2 py-1 font-mono text-sm" {...props} />
  ),
  pre: (props: PreProps) => (
    <pre
      className="bg-muted text-foreground my-6 overflow-x-auto rounded-lg p-4 text-sm"
      {...props}
    />
  ),
  ul: (props: ListProps) => (
    <ul className="text-foreground mb-4 list-inside list-disc space-y-2" {...props} />
  ),
  ol: (props: OrderedListProps) => (
    <ol className="text-foreground mb-4 list-inside list-decimal space-y-2" {...props} />
  ),
  li: (props: ListItemProps) => <li className="leading-relaxed" {...props} />,
  img: (props: ImageProps) => (
    <Image
      className="my-6 h-auto max-w-full rounded-lg shadow-lg"
      width={800}
      height={600}
      loading="lazy"
      alt={props.alt || 'Release image'}
      src={props.src || ''}
    />
  ),
  table: (props: TableProps) => (
    <div className="my-6 overflow-x-auto">
      <table
        className="divide-border border-border min-w-full divide-y rounded-lg border"
        {...props}
      />
    </div>
  ),
  th: (props: ThProps) => (
    <th
      className="bg-container text-muted-foreground px-6 py-4 text-left text-xs font-bold tracking-wider uppercase"
      {...props}
    />
  ),
  td: (props: TdProps) => (
    <td
      className="border-border text-foreground border-t px-6 py-4 text-sm whitespace-nowrap"
      {...props}
    />
  ),

  // Release notes specific components
  ChangeLog: ({ type, children }: { type: string; children: React.ReactNode }) => {
    const changeType = changeTypes.find((ct) => ct.id === type);
    if (!changeType) return <div>{children}</div>;

    return (
      <div
        className={`my-6 rounded-r-lg border-l-4 p-4 ${changeType.color.replace('text-', 'border-').replace('bg-', 'bg-').replace('border-', 'border-l-')}`}
      >
        <div className="mb-2 flex items-center gap-2">
          <span className="text-lg" role="img" aria-label={changeType.label}>
            {changeType.icon}
          </span>
          <h4 className="font-bold">{changeType.label}</h4>
        </div>
        <div className="prose prose-sm max-w-none">{children}</div>
      </div>
    );
  },

  // Warning component
  Warning: ({ children }: { children: React.ReactNode }) => (
    <div className="border-warning bg-muted my-6 rounded-lg border p-4">
      <div className="flex items-start">
        <svg
          className="text-warning mt-1 mr-4 size-5 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L5.35 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        <div className="prose prose-sm text-warning max-w-none">{children}</div>
      </div>
    </div>
  ),

  // Info component
  Info: ({ children }: { children: React.ReactNode }) => (
    <div className="border-info bg-muted my-6 rounded-lg border p-4">
      <div className="flex items-start">
        <svg
          className="text-info mt-1 mr-4 size-5 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div className="prose prose-sm text-info max-w-none">{children}</div>
      </div>
    </div>
  ),

  // Migration guide
  Migration: ({ children }: { children: React.ReactNode }) => (
    <div className="border-primary bg-muted my-6 rounded-lg border p-4">
      <div className="flex items-start">
        <svg
          className="text-primary mt-1 mr-4 size-5 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
        <div>
          <h4 className="text-primary mb-2 font-bold">Migration Information</h4>
          <div className="prose prose-sm text-primary max-w-none">{children}</div>
        </div>
      </div>
    </div>
  ),
};

export default async function ReleaseDetailPage({ params }: ReleasePageProps) {
  const { locale, version } = await params;
  const release = await getRelease(version, locale);

  if (!release) {
    notFound();
  }

  const relatedReleases = await getRelatedReleases(version, 3, locale);

  // Structured data (JSON-LD)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Dayopt',
    applicationCategory: 'BusinessApplication',
    releaseNotes: {
      '@type': 'TechArticle',
      headline: release.frontMatter.title,
      description: release.frontMatter.description,
      author: {
        '@type': 'Person',
        name: release.frontMatter.author || 'Dayopt Team',
      },
      datePublished: release.frontMatter.date,
      keywords: release.frontMatter.tags.join(', '),
      about: {
        '@type': 'SoftwareApplication',
        name: 'Dayopt',
        softwareVersion: release.frontMatter.version,
      },
    },
  };

  return (
    <>
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-background min-h-screen">
        {/* Release header */}
        <ReleaseHeader frontMatter={release.frontMatter} version={version} />

        {/* Cover image */}
        {release.frontMatter.coverImage && (
          <section className="py-8">
            <Container>
              <div className="mx-auto max-w-4xl">
                <Image
                  src={release.frontMatter.coverImage}
                  alt={release.frontMatter.title}
                  width={1200}
                  height={630}
                  className="h-auto w-full rounded-2xl shadow-lg"
                  priority
                />
              </div>
            </Container>
          </section>
        )}

        {/* Release content */}
        <article id="changes" className="py-16">
          <Container>
            <div className="mx-auto max-w-4xl">
              <div className="prose prose-lg max-w-none">
                <MDXRemote source={release.content} components={mdxComponents} />
              </div>

              {/* Release end marker */}
              <div className="border-border mt-16 border-t pt-8">
                <div className="flex items-center justify-center">
                  <div className="flex space-x-2">
                    <div className="bg-border size-2 rounded-full"></div>
                    <div className="bg-border size-2 rounded-full"></div>
                    <div className="bg-border size-2 rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Release information footer */}
              <div className="bg-container mt-8 rounded-2xl p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-muted-foreground mb-1 text-sm">
                      This release takes approximately{' '}
                      <strong>{release.readingTime} minutes</strong> to read
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Release date: {new Date(release.frontMatter.date).toLocaleDateString('en-US')}
                      {release.frontMatter.author && (
                        <span className="ml-4">Release manager: {release.frontMatter.author}</span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <Link
                      href="/releases"
                      className="text-primary hover:text-primary/80 text-sm font-bold"
                    >
                      View all releases
                    </Link>

                    <a
                      href={`https://github.com/yoursaas/platform/releases/tag/v${release.frontMatter.version}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground text-sm font-bold"
                    >
                      View on GitHub
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </article>

        {/* Related releases */}
        {relatedReleases.length > 0 && (
          <section className="py-16">
            <Container>
              <div className="mx-auto max-w-6xl">
                <div className="mb-8">
                  <h2 className="text-foreground mb-4 text-2xl font-bold">Related Releases</h2>
                  <p className="text-muted-foreground">Other updates related to this release</p>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {relatedReleases.map((relatedRelease) => (
                    <ReleaseCard
                      key={relatedRelease.frontMatter.version}
                      release={relatedRelease}
                      layout="vertical"
                    />
                  ))}
                </div>

                <div className="mt-8 text-center">
                  <Link
                    href="/releases"
                    className="border-border bg-card text-foreground hover:bg-muted inline-flex items-center rounded-lg border px-6 py-4 text-sm font-bold transition-colors"
                  >
                    <svg
                      className="mr-2 size-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    View all releases
                  </Link>
                </div>
              </div>
            </Container>
          </section>
        )}

        {/* Feedback & Support */}
        <section className="py-16">
          <Container>
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="text-foreground mb-4 text-2xl font-bold">Share Your Feedback</h2>
              <p className="text-muted-foreground mb-8">
                If you have any questions or feedback about this new feature, please feel free to
                share it with us.
              </p>

              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <a
                  href="mailto:support@yoursaas.com"
                  className="bg-primary text-primary-foreground hover:bg-primary-hover inline-flex items-center rounded-lg px-6 py-4 font-bold transition-colors"
                >
                  <svg
                    className="mr-2 size-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Contact Support
                </a>

                <Link
                  href="/feedback"
                  className="border-border text-foreground hover:bg-muted inline-flex items-center rounded-lg border px-6 py-4 font-bold transition-colors"
                >
                  <svg
                    className="mr-2 size-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  Send Feedback
                </Link>
              </div>
            </div>
          </Container>
        </section>
      </div>
    </>
  );
}
