export const HEIGHT_CLASSES = {
  sm: 'h-14',
  md: 'h-16',
  lg: 'h-20',
};

export const MENU_ALIGNMENT_CLASSES = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
};

export function resolveHref(
  pageId: string | undefined,
  externalUrl: string | undefined,
  slugMap: Record<string, string>,
) {
  if (pageId) {
    const slug = slugMap[pageId];
    return slug ? `/${slug}` : `/${pageId}`;
  }
  return externalUrl || '#';
}
