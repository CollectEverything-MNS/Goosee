import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { TemplateDefinition } from '../data/drive-template';

// Pages conservées quel que soit le template appliqué (obligations légales).
const PROTECTED_SLUGS = ['mentions-legales', 'politique-de-confidentialite'];

async function applyTemplate(template: TemplateDefinition) {
  try {
    const currentSettings = await api.get<{
      metadata?: Record<string, unknown>;
    }>('/settings');
    await api.put('/settings', {
      primaryColor: template.accentColor,
      metadata: {
        ...(currentSettings?.metadata ?? {}),
        templateCategory: template.category,
        templateId: template.id,
      },
    });
  } catch (err) {
    console.warn('Could not persist template theme to settings', err);
  }

  const existingPages = await api.get<{ pages: any[] }>('/pages');
  const pages = existingPages.pages ?? existingPages ?? [];
  const existingBySlug: Record<string, any> = {};
  for (const p of (Array.isArray(pages) ? pages : [])) {
    existingBySlug[p.slug] = p;
  }

  const existingMenus = await api.get<any[]>('/menus');
  const menus = Array.isArray(existingMenus) ? existingMenus : [];
  for (const menu of menus) {
    await api.delete(`/menus/${menu.id}`);
  }

  const createdPages: Record<string, string> = {};

  for (const page of template.pages) {
    const existing = existingBySlug[page.slug];
    if (existing) {
      await api.put(`/pages/${existing.id}`, {
        title: page.title,
        status: page.status,
        type: page.type,
        components: page.components,
        metaTitle: page.metaTitle,
        metaDescription: page.metaDescription,
      });
      createdPages[page.slug] = existing.id;
      delete existingBySlug[page.slug];
    } else {
      const created = await api.post<{ id: string }>('/pages', page);
      createdPages[page.slug] = created.id;
    }
  }

  for (const leftover of Object.values(existingBySlug)) {
    // On ne supprime jamais les pages légales : elles restent hors du template.
    if (PROTECTED_SLUGS.includes(leftover.slug)) continue;
    await api.delete(`/pages/${leftover.id}`);
  }

  for (const menu of template.menus) {
    const pageId = createdPages[menu.slug];
    if (menu.slug === 'contact') {
      await api.post('/menus', {
        label: menu.label,
        externalUrl: '/contact',
        order: menu.order,
        isActive: true,
        openInNewTab: false,
      });
    } else if (pageId) {
      await api.post('/menus', {
        label: menu.label,
        pageId,
        order: menu.order,
        isActive: true,
        openInNewTab: false,
      });
    }
  }

  return { success: true };
}

export function useApplyTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: applyTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}
