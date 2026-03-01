import { apiError, ErrorCode } from '@/lib/api-response';
import { getAllBlogPostMetas } from '@/lib/blog';
import { getClientIp, searchRateLimit } from '@/lib/rate-limit';
import { getAllReleaseMetas } from '@/lib/releases';
import fs from 'fs';
import matter from 'gray-matter';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

interface DocMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  category: string | undefined;
  featured: boolean;
}

// Get document metadata
async function getAllDocMetas(locale?: string): Promise<DocMeta[]> {
  const docsDirectory = locale
    ? path.join(process.cwd(), 'content/docs', locale)
    : path.join(process.cwd(), 'content/docs');

  try {
    if (!fs.existsSync(docsDirectory)) {
      console.warn(`[Search API] Docs directory not found: ${docsDirectory}`);
      return [];
    }

    const getAllMdxFiles = (dir: string): string[] => {
      const files: string[] = [];
      try {
        const items = fs.readdirSync(dir);

        for (const item of items) {
          const fullPath = path.join(dir, item);
          try {
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
              files.push(...getAllMdxFiles(fullPath));
            } else if (item.endsWith('.mdx') || item.endsWith('.md')) {
              files.push(fullPath);
            }
          } catch (statError) {
            console.error(`[Search API] Failed to stat file: ${fullPath}`, statError);
          }
        }
      } catch (readError) {
        console.error(`[Search API] Failed to read directory: ${dir}`, readError);
      }

      return files;
    };

    const mdxFiles = getAllMdxFiles(docsDirectory);
    const docMetas: DocMeta[] = [];
    const errors: { file: string; error: unknown }[] = [];

    for (const filePath of mdxFiles) {
      try {
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const { data: frontMatter } = matter(fileContents);

        // Skip draft content
        if (frontMatter.draft) continue;

        // Generate slug from file path
        const relativePath = path.relative(docsDirectory, filePath);
        const slug = relativePath.replace(/\.(mdx?|md)$/, '').replace(/\\/g, '/');

        docMetas.push({
          slug: slug,
          title: (frontMatter.title as string) || 'Untitled',
          description: (frontMatter.description as string) || '',
          date:
            (frontMatter.publishedAt as string) ||
            (frontMatter.updatedAt as string) ||
            new Date().toISOString(),
          tags: (frontMatter.tags as string[]) || [],
          category: frontMatter.category as string | undefined,
          featured: (frontMatter.featured as boolean) || false,
        });
      } catch (err) {
        errors.push({ file: filePath, error: err });
      }
    }

    if (errors.length > 0) {
      console.error(`[Search API] Failed to process ${errors.length} document(s):`);
      errors.forEach(({ file, error }) => {
        console.error(`  - ${file}:`, error instanceof Error ? error.message : error);
      });
    }

    return docMetas.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('[Search API] Unexpected error in getAllDocMetas:', error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    // レート制限チェック
    const ip = getClientIp(request);
    const { success } = await searchRateLimit.limit(ip);

    if (!success) {
      return apiError('Too many requests. Please try again later.', 429, {
        code: ErrorCode.RATE_LIMIT_EXCEEDED,
      });
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ results: [] });
    }

    // Validate query length to prevent DoS
    if (query.length > 200) {
      return apiError('Search query too long', 400, { code: ErrorCode.QUERY_TOO_LONG });
    }

    const locale = searchParams.get('locale') || undefined;

    const contentErrors: string[] = [];
    const [blogPosts, releases, docs] = await Promise.all([
      getAllBlogPostMetas(locale).catch((error) => {
        contentErrors.push(`blog: ${error instanceof Error ? error.message : String(error)}`);
        return [];
      }),
      getAllReleaseMetas(locale).catch((error) => {
        contentErrors.push(`releases: ${error instanceof Error ? error.message : String(error)}`);
        return [];
      }),
      getAllDocMetas(locale).catch((error) => {
        contentErrors.push(`docs: ${error instanceof Error ? error.message : String(error)}`);
        return [];
      }),
    ]);

    if (contentErrors.length > 0) {
      console.warn('[Search API] Some content sources failed:', contentErrors.join(', '));
    }

    const searchTerm = query.toLowerCase();
    const results = [];

    // Search blog posts
    for (const post of blogPosts) {
      const titleMatch = post.frontMatter.title.toLowerCase().includes(searchTerm);
      const descriptionMatch =
        post.frontMatter.description?.toLowerCase().includes(searchTerm) || false;
      const tagMatch =
        post.frontMatter.tags?.some((tag) => tag.toLowerCase().includes(searchTerm)) || false;

      if (titleMatch || descriptionMatch || tagMatch) {
        results.push({
          id: post.slug,
          title: post.frontMatter.title,
          description: post.frontMatter.description || '',
          url: `/blog/${post.slug}`,
          type: 'blog',
          breadcrumbs: ['Blog', post.frontMatter.category || 'Uncategorized'],
          lastModified: post.frontMatter.publishedAt,
          tags: post.frontMatter.tags || [],
        });
      }
    }

    // Search releases
    for (const release of releases) {
      const titleMatch = release.frontMatter.title.toLowerCase().includes(searchTerm);
      const descriptionMatch =
        release.frontMatter.description?.toLowerCase().includes(searchTerm) || false;
      const tagMatch =
        release.frontMatter.tags?.some((tag) => tag.toLowerCase().includes(searchTerm)) || false;

      if (titleMatch || descriptionMatch || tagMatch) {
        results.push({
          id: release.frontMatter.version || release.slug,
          title: release.frontMatter.title,
          description: release.frontMatter.description || '',
          url: `/releases/${release.frontMatter.version || release.slug}`,
          type: 'release',
          breadcrumbs: ['Releases', release.frontMatter.version || release.slug],
          lastModified: release.frontMatter.date,
          tags: release.frontMatter.tags || [],
        });
      }
    }

    // Search documents
    for (const doc of docs) {
      const titleMatch = doc.title.toLowerCase().includes(searchTerm);
      const descriptionMatch = doc.description?.toLowerCase().includes(searchTerm) || false;
      const tagMatch =
        doc.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm)) || false;

      if (titleMatch || descriptionMatch || tagMatch) {
        results.push({
          id: doc.slug,
          title: doc.title,
          description: doc.description || '',
          url: `/docs/${doc.slug}`,
          type: 'docs',
          breadcrumbs: ['Documentation', doc.category || 'Uncategorized'],
          lastModified: doc.date,
          tags: doc.tags || [],
        });
      }
    }

    // Sort by relevance (prioritize title matches)
    results.sort((a, b) => {
      const aTitleMatch = a.title.toLowerCase().includes(searchTerm);
      const bTitleMatch = b.title.toLowerCase().includes(searchTerm);

      if (aTitleMatch && !bTitleMatch) return -1;
      if (!aTitleMatch && bTitleMatch) return 1;

      return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
    });

    return NextResponse.json({ results: results.slice(0, 50) });
  } catch {
    return apiError('Search failed', 500, { code: ErrorCode.INTERNAL_ERROR });
  }
}
