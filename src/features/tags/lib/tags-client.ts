// Client-side tag utilities (without fs module)

export interface TagCount {
  tag: string;
  count: number;
}

export interface TaggedContent {
  type: 'blog' | 'release' | 'doc';
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  category?: string;
  featured?: boolean;
  version?: string; // For releases
  breaking?: boolean; // For releases
}

export interface UnifiedTagData {
  tag: string;
  totalCount: number;
  blog: TaggedContent[];
  releases: TaggedContent[];
  docs: TaggedContent[];
}
