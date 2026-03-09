import { fetchData, postData, updateData, deleteData, publicFetch, uploadFile } from './api';

export type PostCategory = 'NEWS' | 'BLOG' | 'LIFESTYLE' | 'MUSIC' | 'EVENTS' | 'OTHER';
export type PostStatus = 'DRAFT' | 'PUBLISHED';

export interface PostAuthor {
  firstName: string;
  lastName: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  coverImage: string | null;
  category: PostCategory;
  status: PostStatus;
  tags: string[];
  publishedAt: string | null;
  authorId: string;
  author: PostAuthor;
  createdAt: string;
  updatedAt: string;
}

export interface PostSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  category: PostCategory;
  tags: string[];
  publishedAt: string | null;
  author: PostAuthor;
}

export interface PaginatedPosts<T> {
  total: number;
  page: number;
  limit: number;
  data: T[];
}

export interface CreatePostPayload {
  title: string;
  body: string;
  excerpt?: string;
  coverImage?: string | null;
  category?: PostCategory;
  tags?: string[];
}

// ── Public ──────────────────────────────────────────────────────────────────

export function getPublishedPosts(query: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
} = {}): Promise<PaginatedPosts<PostSummary>> {
  const params = new URLSearchParams();
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  if (query.category) params.set('category', query.category);
  if (query.search) params.set('search', query.search);
  const qs = params.toString();
  return publicFetch<PaginatedPosts<PostSummary>>(`/media${qs ? `?${qs}` : ''}`);
}

export function getPublishedPostBySlug(slug: string): Promise<Post> {
  return publicFetch<Post>(`/media/${slug}`);
}

// ── Admin ────────────────────────────────────────────────────────────────────

export function getAdminPosts(query: {
  page?: number;
  limit?: number;
  status?: PostStatus;
  search?: string;
} = {}): Promise<PaginatedPosts<Post>> {
  const params = new URLSearchParams();
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  if (query.status) params.set('status', query.status);
  if (query.search) params.set('search', query.search);
  const qs = params.toString();
  return fetchData<PaginatedPosts<Post>>(`/a/media${qs ? `?${qs}` : ''}`);
}

export function getAdminPostById(id: string): Promise<Post> {
  return fetchData<Post>(`/a/media/${id}`);
}

export function createPost(dto: CreatePostPayload): Promise<Post> {
  return postData<Post>('/a/media', dto);
}

export function updatePost(id: string, dto: Partial<CreatePostPayload>): Promise<Post> {
  return updateData<Post>(`/a/media/${id}`, dto);
}

export function publishPost(id: string): Promise<Post> {
  return updateData<Post>(`/a/media/${id}/publish`, {});
}

export function unpublishPost(id: string): Promise<Post> {
  return updateData<Post>(`/a/media/${id}/unpublish`, {});
}

export function deletePost(id: string): Promise<void> {
  return deleteData<void>(`/a/media/${id}`);
}

export async function uploadPostCover(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await uploadFile<{ url: string }>('/upload/event-cover', formData);
  return res.url;
}

export const POST_CATEGORIES: { value: PostCategory; label: string }[] = [
  { value: 'NEWS', label: 'News' },
  { value: 'BLOG', label: 'Blog' },
  { value: 'LIFESTYLE', label: 'Lifestyle' },
  { value: 'MUSIC', label: 'Music' },
  { value: 'EVENTS', label: 'Events' },
  { value: 'OTHER', label: 'Other' },
];
