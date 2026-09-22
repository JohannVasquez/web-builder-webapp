'use client';

import { useState, type ReactElement } from 'react';
import Link from 'next/link';
import { Loader2, Plus, Edit2, Trash2, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { useAdminApi } from './useAdminApi';
import { useAsyncData, refreshAsyncData } from '@/shared/lib/useAsyncData';
import { blogPostListResponseSchema, type BlogPost } from '../domain/BlogApi';
import { translatePostStatus, formatPostDate, isScheduledPostVisible } from '../application/blogPresentation';
import { describeAdminError } from '../application/adminErrorMessage';
import { toast } from 'sonner';
import { Button } from '@/shared/ui/button';

export interface BlogManagerProps {
  readonly tenantId: string;
}

const POSTS_CACHE_KEY = 'admin:blog-posts';

export function BlogManager({ tenantId }: BlogManagerProps): ReactElement {
  const api = useAdminApi();
  const [pendingActionId, setPendingActionId] = useState<number | null>(null);

  const cacheKey = `${POSTS_CACHE_KEY}:${tenantId}`;
  const posts = useAsyncData(cacheKey, () =>
    api.get(`/api/admin/tenants/${tenantId}/posts`, blogPostListResponseSchema),
  );

  const handleDelete = async (post: BlogPost): Promise<void> => {
    const confirmed = window.confirm(
      `Vas a eliminar la publicación "${post.title}". Esta acción no se puede deshacer. ¿Continuar?`,
    );
    if (!confirmed) {
      return;
    }
    setPendingActionId(post.id);
    try {
      await api.remove(`/api/admin/tenants/${tenantId}/posts/${String(post.id)}`);
      refreshAsyncData(cacheKey);
      toast.success('Publicación eliminada.');
    } catch (cause) {
      toast.error(
        describeAdminError(
          cause,
          'No pudimos eliminar la publicación. Inténtalo nuevamente.',
        ).message,
      );
    } finally {
      setPendingActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="ui-heading text-2xl">Blog</h1>
        <Button asChild>
          <Link href={`/clientes/${tenantId}/blog/nueva`}>
            <Plus className="size-4" /> Crear publicación
          </Link>
        </Button>
      </div>

      {posts.error !== null && (
        <p role="alert" className="text-destructive">
          {posts.error}
        </p>
      )}

      {posts.error === null && (posts.isLoading || posts.data === null) && (
        <p className="text-muted-foreground flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" /> Cargando publicaciones...
        </p>
      )}

      {posts.data !== null && (
        <PostList
          posts={posts.data.posts}
          tenantId={tenantId}
          pendingActionId={pendingActionId}
          onDelete={(post) => void handleDelete(post)}
        />
      )}
    </div>
  );
}

export interface PostListProps {
  readonly posts: readonly BlogPost[];
  readonly tenantId: string;
  readonly pendingActionId: number | null;
  readonly onDelete: (post: BlogPost) => void;
}

export function PostList({
  posts,
  tenantId,
  pendingActionId,
  onDelete,
}: PostListProps): ReactElement {
  if (posts.length === 0) {
    return <p className="text-muted-foreground">Todavía no hay publicaciones.</p>;
  }

  return (
    <ul className="space-y-4">
      {posts.map((post) => (
        <PostRow
          key={post.id}
          post={post}
          tenantId={tenantId}
          isPending={pendingActionId === post.id}
          onDelete={() => onDelete(post)}
        />
      ))}
    </ul>
  );
}

interface PostRowProps {
  readonly post: BlogPost;
  readonly tenantId: string;
  readonly isPending: boolean;
  readonly onDelete: () => void;
}

function PostRow({ post, tenantId, isPending, onDelete }: PostRowProps): ReactElement {
  const isVisible = isScheduledPostVisible(post.status, post.publishedAt);
  const statusLabel = translatePostStatus(post.status);
  
  return (
    <li className="ui-card space-y-3 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="font-medium">{post.title}</span>
          <span className="text-muted-foreground text-sm">
            {post.authorName} • {formatPostDate(post.publishedAt)}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <span
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
              post.status === 'published' || isVisible
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300'
                : post.status === 'scheduled'
                ? 'bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {post.status === 'published' || isVisible ? (
              <CheckCircle2 className="size-3" />
            ) : post.status === 'scheduled' ? (
              <Calendar className="size-3" />
            ) : (
              <FileText className="size-3" />
            )}
            {isVisible && post.status === 'scheduled' ? 'Publicada (Programada)' : statusLabel}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <Button
          asChild
          size="sm"
          variant="outline"
          disabled={isPending}
        >
          <Link href={`/clientes/${tenantId}/blog/${String(post.id)}`}>
            <Edit2 className="size-4" /> Editar
          </Link>
        </Button>
        <Button
          type="button"
          size="sm"
          variant="destructive"
          disabled={isPending}
          aria-label={`Eliminar "${post.title}"`}
          onClick={onDelete}
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Trash2 className="size-4" />
          )}
          Eliminar
        </Button>
      </div>
    </li>
  );
}
