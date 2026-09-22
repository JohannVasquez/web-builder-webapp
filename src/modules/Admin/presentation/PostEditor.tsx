'use client';

import { useState, type ReactElement, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import { useAdminApi } from './useAdminApi';
import { useAsyncData, refreshAsyncData } from '@/shared/lib/useAsyncData';
import { useUnsavedChangesGuard } from './useUnsavedChangesGuard';
import { describeAdminError } from '../application/adminErrorMessage';
import {
  generateSlugFromTitle,
  toLocalDateTimeInput,
} from '../application/blogPresentation';
import { blogPostResponseSchema, type BlogPost, type BlogBlock } from '../domain/BlogApi';
import { toast } from 'sonner';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';

export interface PostEditorProps {
  readonly tenantId: string;
  readonly postId?: string; // Si es undefined, es crear nueva
}

const POSTS_CACHE_KEY = 'admin:blog-posts';

export function PostEditor({ tenantId, postId }: PostEditorProps): ReactElement {
  const api = useAdminApi();
  const isEditing = postId !== undefined;

  const cacheKey = `admin:post:${tenantId}:${postId ?? 'new'}`;
  const postData = useAsyncData(cacheKey, async () => {
    if (!isEditing) {
      return null;
    }
    return api.get(
      `/api/admin/tenants/${tenantId}/posts/${postId}`,
      blogPostResponseSchema,
    );
  });

  if (isEditing && postData.isLoading) {
    return (
      <p className="text-muted-foreground flex items-center gap-2">
        <Loader2 className="size-4 animate-spin" /> Cargando publicación...
      </p>
    );
  }

  if (isEditing && postData.error !== null) {
    return (
      <p role="alert" className="text-destructive">
        {postData.error}
      </p>
    );
  }

  const initialPost = isEditing && postData.data !== null ? postData.data.post : null;

  return <PostForm tenantId={tenantId} postId={postId} initialPost={initialPost} />;
}

interface PostFormProps {
  readonly tenantId: string;
  readonly postId?: string;
  readonly initialPost: BlogPost | null;
}

function PostForm({ tenantId, postId, initialPost }: PostFormProps): ReactElement {
  const router = useRouter();
  const api = useAdminApi();
  const isEditing = postId !== undefined;

  const [title, setTitle] = useState(initialPost?.title ?? '');
  const [slug, setSlug] = useState(initialPost?.slug ?? '');
  const [slugEdited, setSlugEdited] = useState(isEditing);
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt ?? '');
  const [authorName, setAuthorName] = useState(initialPost?.authorName ?? '');
  const [status, setStatus] = useState<'draft' | 'published' | 'scheduled'>(
    initialPost?.status ?? 'draft',
  );
  const [publishedAt, setPublishedAt] = useState(
    toLocalDateTimeInput(initialPost?.publishedAt ?? null),
  );
  const [tags, setTags] = useState(initialPost?.tags.join(', ') ?? '');
  const [seoTitle, setSeoTitle] = useState(initialPost?.seoTitle ?? '');
  const [seoDescription, setSeoDescription] = useState(initialPost?.seoDescription ?? '');
  const [content, setContent] = useState<readonly BlogBlock[]>(
    initialPost?.content ?? [],
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<{
    message: string;
    issues: readonly { path: string; message: string }[];
  } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useUnsavedChangesGuard(hasChanges);

  const handleChangeTitle = (newTitle: string): void => {
    setTitle(newTitle);
    setHasChanges(true);
    if (!slugEdited && !isEditing) {
      setSlug(generateSlugFromTitle(newTitle));
    }
  };

  const handleBlockChange = (index: number, newBlock: BlogBlock): void => {
    const next = [...content];
    next[index] = newBlock;
    setContent(next);
    setHasChanges(true);
  };

  const moveBlock = (index: number, direction: 'up' | 'down'): void => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === content.length - 1) return;

    const next = [...content];
    const swapWith = direction === 'up' ? index - 1 : index + 1;
    const temp = next[index];
    if (temp !== undefined && next[swapWith] !== undefined) {
      next[index] = next[swapWith];
      next[swapWith] = temp;
    }
    setContent(next);
    setHasChanges(true);
  };

  const removeBlock = (index: number): void => {
    const next = content.filter((_, i) => i !== index);
    setContent(next);
    setHasChanges(true);
  };

  const addBlock = (type: BlogBlock['type']): void => {
    let newBlock: BlogBlock;
    switch (type) {
      case 'paragraph':
        newBlock = { type: 'paragraph', text: '' };
        break;
      case 'heading':
        newBlock = { type: 'heading', text: '', level: 2 };
        break;
      case 'quote':
        newBlock = { type: 'quote', text: '' };
        break;
      case 'list':
        newBlock = { type: 'list', items: [''] };
        break;
      case 'image':
        newBlock = { type: 'image', key: '', alt: '' };
        break;
      case 'video':
        newBlock = { type: 'video', url: '', caption: '' };
        break;
      case 'divider':
        newBlock = { type: 'divider' };
        break;
    }
    setContent([...content, newBlock]);
    setHasChanges(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    const payload = {
      title,
      slug,
      excerpt: excerpt === '' ? null : excerpt,
      authorName,
      status,
      publishedAt: publishedAt === '' ? null : new Date(publishedAt).toISOString(),
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0),
      seoTitle: seoTitle === '' ? null : seoTitle,
      seoDescription: seoDescription === '' ? null : seoDescription,
      content,
    };

    try {
      if (isEditing) {
        await api.patch(
          `/api/admin/tenants/${tenantId}/posts/${postId}`,
          payload,
          blogPostResponseSchema,
        );
        toast.success('Publicación actualizada.');
      } else {
        await api.post(
          `/api/admin/tenants/${tenantId}/posts`,
          payload,
          blogPostResponseSchema,
        );
        toast.success('Publicación creada.');
      }
      setHasChanges(false);
      refreshAsyncData(`${POSTS_CACHE_KEY}:${tenantId}`);
      router.push(`/clientes/${tenantId}/blog`);
    } catch (cause) {
      setFormError(
        describeAdminError(
          cause,
          'No pudimos guardar la publicación. Inténtalo nuevamente.',
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-8" noValidate>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="ui-heading text-2xl">
          {isEditing ? 'Editar publicación' : 'Nueva publicación'}
        </h1>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/clientes/${tenantId}/blog`)}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}{' '}
            {isEditing ? 'Guardar cambios' : 'Crear publicación'}
          </Button>
        </div>
      </div>

      {formError !== null && (
        <div
          role="alert"
          className="text-destructive bg-destructive/10 rounded-md p-4 text-sm"
        >
          <p className="font-medium">{formError.message}</p>
          {formError.issues.length > 0 && (
            <ul className="mt-2 list-disc pl-5">
              {formError.issues.map((issue) => (
                <li key={issue.path}>
                  {issue.path}: {issue.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <section className="ui-card space-y-4 p-5">
            <h2 className="ui-heading text-lg">Contenido principal</h2>
            <div className="space-y-2">
              <Label htmlFor="post-title">Título</Label>
              <Input
                id="post-title"
                value={title}
                onChange={(e) => handleChangeTitle(e.target.value)}
                placeholder="Ej. Novedades de este mes"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="post-excerpt">Extracto</Label>
              <Textarea
                id="post-excerpt"
                value={excerpt}
                onChange={(e) => {
                  setExcerpt(e.target.value);
                  setHasChanges(true);
                }}
                placeholder="Breve resumen de la publicación..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Contenido (Bloques)</Label>
              <div className="space-y-4">
                {content.map((block, index) => (
                  <div
                    key={index}
                    className="flex gap-3 items-start border rounded-md p-4 bg-muted/30"
                  >
                    <div className="flex-1 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold uppercase text-muted-foreground">
                          {block.type}
                        </span>
                      </div>

                      {block.type === 'paragraph' && (
                        <Textarea
                          aria-label={`Texto del bloque ${String(index + 1)}`}
                          value={block.text}
                          onChange={(e) =>
                            handleBlockChange(index, { ...block, text: e.target.value })
                          }
                          placeholder="Texto del párrafo..."
                          rows={4}
                        />
                      )}

                      {block.type === 'heading' && (
                        <div className="flex gap-2">
                          <select
                            aria-label={`Nivel del encabezado del bloque ${String(index + 1)}`}
                            className="ui-input h-10 w-24 px-3"
                            value={block.level}
                            onChange={(e) =>
                              handleBlockChange(index, {
                                ...block,
                                level: parseInt(e.target.value, 10),
                              })
                            }
                          >
                            <option value={2}>H2</option>
                            <option value={3}>H3</option>
                            <option value={4}>H4</option>
                          </select>
                          <Input
                            aria-label={`Texto del bloque ${String(index + 1)}`}
                            className="flex-1"
                            value={block.text}
                            onChange={(e) =>
                              handleBlockChange(index, { ...block, text: e.target.value })
                            }
                            placeholder="Texto del encabezado"
                          />
                        </div>
                      )}

                      {block.type === 'quote' && (
                        <Textarea
                          aria-label={`Texto del bloque ${String(index + 1)}`}
                          value={block.text}
                          onChange={(e) =>
                            handleBlockChange(index, { ...block, text: e.target.value })
                          }
                          placeholder="Texto de la cita..."
                          className="border-l-4 border-l-primary"
                          rows={3}
                        />
                      )}

                      {block.type === 'list' && (
                        <div className="space-y-2">
                          {block.items.map((item, itemIndex) => (
                            <div key={itemIndex} className="flex gap-2">
                              <span className="mt-2 text-muted-foreground">•</span>
                              <Input
                                aria-label={`Elemento ${String(itemIndex + 1)} de la lista`}
                                value={item}
                                onChange={(e) => {
                                  const newItems = [...block.items];
                                  newItems[itemIndex] = e.target.value;
                                  handleBlockChange(index, { ...block, items: newItems });
                                }}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newItems = block.items.filter(
                                    (_, i) => i !== itemIndex,
                                  );
                                  handleBlockChange(index, { ...block, items: newItems });
                                }}
                              >
                                Quitar
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleBlockChange(index, {
                                ...block,
                                items: [...block.items, ''],
                              })
                            }
                          >
                            Agregar elemento
                          </Button>
                        </div>
                      )}

                      {block.type === 'image' && (
                        <div className="space-y-2">
                          <Input
                            aria-label={`Imagen del bloque ${String(index + 1)}: key de la biblioteca`}
                            value={block.key}
                            onChange={(e) =>
                              handleBlockChange(index, { ...block, key: e.target.value })
                            }
                            placeholder="Llave de la imagen (ej. images/foto.jpg)"
                          />
                          <Input
                            aria-label={`Texto alternativo de la imagen del bloque ${String(index + 1)}`}
                            value={block.alt}
                            onChange={(e) =>
                              handleBlockChange(index, { ...block, alt: e.target.value })
                            }
                            placeholder="Texto alternativo"
                          />
                        </div>
                      )}

                      {block.type === 'video' && (
                        <div className="space-y-2">
                          <Input
                            aria-label={`Dirección del video del bloque ${String(index + 1)}`}
                            value={block.url}
                            onChange={(e) =>
                              handleBlockChange(index, { ...block, url: e.target.value })
                            }
                            placeholder="URL del video (ej. YouTube)"
                          />
                          <Input
                            aria-label={`Leyenda del video del bloque ${String(index + 1)}`}
                            value={block.caption}
                            onChange={(e) =>
                              handleBlockChange(index, {
                                ...block,
                                caption: e.target.value,
                              })
                            }
                            placeholder="Leyenda del video"
                          />
                        </div>
                      )}

                      {block.type === 'divider' && (
                        <hr className="my-4 border-muted-foreground/30" />
                      )}
                    </div>

                    <div className="flex flex-col gap-1 shrink-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={index === 0}
                        onClick={() => moveBlock(index, 'up')}
                        className="px-2"
                      >
                        <ArrowUp className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={index === content.length - 1}
                        onClick={() => moveBlock(index, 'down')}
                        className="px-2"
                      >
                        <ArrowDown className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeBlock(index)}
                        className="px-2 text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="text-sm text-muted-foreground w-full block mb-1">
                    Agregar bloque:
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addBlock('paragraph')}
                  >
                    Párrafo
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addBlock('heading')}
                  >
                    Encabezado
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addBlock('quote')}
                  >
                    Cita
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addBlock('list')}
                  >
                    Lista
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addBlock('image')}
                  >
                    Imagen
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addBlock('video')}
                  >
                    Video
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addBlock('divider')}
                  >
                    Separador
                  </Button>
                </div>
              </div>
            </div>
          </section>

          <section className="ui-card space-y-4 p-5">
            <h2 className="ui-heading text-lg">SEO</h2>
            <div className="space-y-2">
              <Label htmlFor="post-seo-title">Título SEO (opcional)</Label>
              <Input
                id="post-seo-title"
                value={seoTitle}
                onChange={(e) => {
                  setSeoTitle(e.target.value);
                  setHasChanges(true);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="post-seo-desc">Descripción SEO (opcional)</Label>
              <Textarea
                id="post-seo-desc"
                value={seoDescription}
                onChange={(e) => {
                  setSeoDescription(e.target.value);
                  setHasChanges(true);
                }}
                rows={2}
              />
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="ui-card space-y-4 p-5">
            <h2 className="ui-heading text-lg">Configuración</h2>

            <div className="space-y-2">
              <Label htmlFor="post-status">Estado</Label>
              <select
                id="post-status"
                className="ui-input w-full h-10 px-3"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as 'draft' | 'published' | 'scheduled');
                  setHasChanges(true);
                }}
              >
                <option value="draft">Borrador</option>
                <option value="published">Publicada</option>
                <option value="scheduled">Programada</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="post-published-at">Fecha de publicación</Label>
              <Input
                id="post-published-at"
                type="datetime-local"
                value={publishedAt}
                onChange={(e) => {
                  setPublishedAt(e.target.value);
                  setHasChanges(true);
                }}
                required={status === 'scheduled'}
              />
              {status === 'scheduled' && (
                <p className="text-xs text-muted-foreground mt-1">
                  La publicación no aparecerá en el sitio hasta esta fecha.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="post-slug">Dirección (URL)</Label>
              <Input
                id="post-slug"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugEdited(true);
                  setHasChanges(true);
                }}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="post-author">Autor</Label>
              <Input
                id="post-author"
                value={authorName}
                onChange={(e) => {
                  setAuthorName(e.target.value);
                  setHasChanges(true);
                }}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="post-tags">Etiquetas</Label>
              <Input
                id="post-tags"
                value={tags}
                onChange={(e) => {
                  setTags(e.target.value);
                  setHasChanges(true);
                }}
                placeholder="noticias, productos, equipo"
              />
              <p className="text-xs text-muted-foreground mt-1">Separadas por comas</p>
            </div>
          </section>
        </div>
      </div>
    </form>
  );
}
