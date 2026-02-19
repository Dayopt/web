import { RelatedPosts } from '@/components/blog/RelatedPosts';
import { ShareButton } from '@/components/blog/ShareButton';
import { ClientTableOfContents } from '@/components/docs/ClientTableOfContents';
import { Container } from '@/components/ui/container';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { getAllBlogPostMetas, getBlogPost, getRelatedPosts } from '@/lib/blog';
import { generateSEOMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

interface BlogPostPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

type HeadingProps = ComponentPropsWithoutRef<'h1'> & { children?: ReactNode };
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

// Generate metadata
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getBlogPost(slug, locale);

  if (!post) {
    return generateSEOMetadata({
      title: locale === 'ja' ? '記事が見つかりません' : 'Article Not Found',
      description:
        locale === 'ja'
          ? 'お探しの記事は見つかりませんでした。'
          : 'The article you are looking for could not be found.',
      url: `/${locale}/blog/${slug}`,
      locale: locale,
    });
  }

  const { frontMatter } = post;

  return generateSEOMetadata({
    title: frontMatter.title,
    description: frontMatter.description,
    url: `/${locale}/blog/${slug}`,
    locale: locale,
    type: 'article',
    publishedTime: frontMatter.publishedAt,
    modifiedTime: frontMatter.updatedAt || frontMatter.publishedAt,
    authors: [frontMatter.author],
    tags: frontMatter.tags,
    keywords: frontMatter.tags,
    image: frontMatter.coverImage,
    section: frontMatter.category,
  });
}

// ISR: ブログ記事は1時間ごとに再検証
export const revalidate = 3600;

// Generate static paths
export async function generateStaticParams() {
  const params = [];

  for (const locale of routing.locales) {
    const posts = await getAllBlogPostMetas(locale);
    for (const post of posts) {
      params.push({ locale, slug: post.slug });
    }
  }

  return params;
}

// MDX components
const mdxComponents = {
  h1: (props: HeadingProps) => {
    const id =
      props.children
        ?.toString()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '') || '';
    return (
      <h1 id={id} className="text-foreground mt-8 mb-4 text-3xl font-bold first:mt-0" {...props} />
    );
  },
  h2: (props: HeadingProps) => {
    const id =
      props.children
        ?.toString()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '') || '';
    return <h2 id={id} className="text-foreground mt-8 mb-4 text-2xl font-bold" {...props} />;
  },
  h3: (props: HeadingProps) => {
    const id =
      props.children
        ?.toString()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '') || '';
    return <h3 id={id} className="text-foreground mt-6 mb-4 text-xl font-bold" {...props} />;
  },
  h4: (props: HeadingProps) => {
    const id =
      props.children
        ?.toString()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '') || '';
    return <h4 id={id} className="text-foreground mt-6 mb-4 text-lg font-bold" {...props} />;
  },
  p: (props: ParagraphProps) => (
    <p className="text-foreground mb-4 text-xl leading-relaxed" {...props} />
  ),
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
      className="border-info bg-muted text-foreground my-6 rounded-r-lg border-l-4 py-2 pl-4 text-xl italic"
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
    <ul className="text-foreground mb-4 list-inside list-disc space-y-2 text-xl" {...props} />
  ),
  ol: (props: OrderedListProps) => (
    <ol className="text-foreground mb-4 list-inside list-decimal space-y-2 text-xl" {...props} />
  ),
  li: (props: ListItemProps) => <li className="leading-relaxed" {...props} />,
  img: (props: ImageProps) => (
    <div className="relative my-6 overflow-hidden rounded-lg shadow-lg">
      <Image
        className="rounded-lg shadow-lg"
        loading="lazy"
        width={800}
        height={600}
        style={{ width: '100%', height: 'auto' }}
        alt={props.alt || 'Blog post image'}
        src={props.src || ''}
      />
    </div>
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
  Callout: ({
    type = 'info',
    children,
  }: {
    type?: 'info' | 'warning' | 'error' | 'success';
    children: React.ReactNode;
  }) => {
    const styles = {
      info: 'bg-muted border-info text-info',
      warning: 'bg-muted border-warning text-warning',
      error: 'bg-muted border-destructive text-destructive',
      success: 'bg-muted border-success text-success',
    };

    const icons = {
      info: '💡',
      warning: '⚠️',
      error: '❌',
      success: '✅',
    };

    return (
      <div className={`my-6 rounded-r-lg border-l-4 p-4 ${styles[type]}`}>
        <div className="flex items-start">
          <span className="mr-4 flex-shrink-0 text-lg">{icons[type]}</span>
          <div className="prose prose-sm max-w-none">{children}</div>
        </div>
      </div>
    );
  },
};

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('blog.share');

  const post = await getBlogPost(slug, locale);

  if (!post) {
    notFound();
  }

  // Remove duplicate title and description from MDX content
  let processedContent = post.content;

  const titlePattern = new RegExp(
    `^# ${post.frontMatter.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\n`,
    'gm',
  );
  processedContent = processedContent.replace(titlePattern, '');

  if (post.frontMatter.description) {
    const descPattern = new RegExp(
      `^${post.frontMatter.description.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\n`,
      'gm',
    );
    processedContent = processedContent.replace(descPattern, '');
  }

  processedContent = processedContent.replace(/^# [^\n]*\n+/gm, '');

  const lines = processedContent.split('\n');
  const processedLines = [];

  for (let i = 0; i < lines.length; i++) {
    const currentLine = lines[i];
    if (currentLine === undefined) continue;
    const line = currentLine.trim();

    if (processedLines.length === 0 && line === '') continue;

    if (processedLines.length === 0 && line && !line.startsWith('#') && !line.startsWith('```')) {
      continue;
    }

    processedLines.push(currentLine);
  }

  processedContent = processedLines.join('\n');

  const relatedPosts = await getRelatedPosts(slug, 3, locale);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.frontMatter.title,
    description: post.frontMatter.description,
    author: {
      '@type': 'Person',
      name: post.frontMatter.author,
    },
    datePublished: post.frontMatter.publishedAt,
    dateModified: post.frontMatter.updatedAt || post.frontMatter.publishedAt,
    keywords: post.frontMatter.tags.join(', '),
    articleSection: post.frontMatter.category,
    wordCount: post.readingTime * 200,
    timeRequired: `PT${post.readingTime}M`,
    image: post.frontMatter.coverImage,
    publisher: {
      '@type': 'Organization',
      name: 'Dayopt Platform',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-background min-h-screen">
        <article className="py-8">
          <Container>
            <div className="flex justify-center gap-8">
              <div className="max-w-2xl flex-shrink-0 pt-16">
                <div className="mb-8">
                  <nav aria-label="breadcrumb" className="flex items-center space-x-2 text-sm">
                    <Link
                      href="/"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Home
                    </Link>
                    <span className="text-border">/</span>
                    <Link
                      href="/blog"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Blog
                    </Link>
                    <span className="text-border">/</span>
                    <span className="text-foreground font-bold">{post.frontMatter.title}</span>
                  </nav>
                </div>

                <time
                  className="text-muted-foreground mb-2 block text-sm"
                  dateTime={post.frontMatter.publishedAt}
                >
                  {new Date(post.frontMatter.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>

                <h1 className="text-foreground mb-8 text-4xl font-bold">
                  {post.frontMatter.title}
                </h1>

                {post.frontMatter.coverImage && (
                  <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-2xl shadow-lg">
                    <Image
                      src={post.frontMatter.coverImage}
                      alt={post.frontMatter.title}
                      fill
                      className="rounded-2xl object-cover"
                      priority
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                    />
                  </div>
                )}

                <div className="prose prose-lg max-w-none">
                  <MDXRemote source={processedContent} components={mdxComponents} />
                </div>

                <div className="border-border mt-8 border-t pt-6"></div>

                <div className="mt-6 space-y-6">
                  <div>
                    <h3 className="text-foreground mb-4 text-lg font-bold">Tags Used</h3>
                    <div className="flex flex-wrap gap-2">
                      {post.frontMatter.tags.map((tag) => (
                        <Link
                          key={tag}
                          href={`/tags/${encodeURIComponent(tag)}`}
                          className="bg-muted text-muted-foreground hover:bg-secondary-hover inline-flex items-center rounded-full px-4 py-1 text-sm font-bold transition-colors"
                        >
                          #{tag}
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-foreground mb-4 text-lg font-bold">{t('title')}</h3>
                    <ShareButton title={post.frontMatter.title} slug={slug} />
                  </div>
                </div>
              </div>

              <aside className="hidden w-60 flex-shrink-0 xl:block">
                <div className="sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto pt-16 pl-6">
                  <ClientTableOfContents content={post.content} />
                </div>
              </aside>
            </div>
          </Container>
        </article>

        <RelatedPosts posts={relatedPosts} currentSlug={slug} locale={locale} />
      </div>
    </>
  );
}
