'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface PreviewFrameProps {
  /** Largeur CSS de l'iframe (ex: '100%', '768px', '375px'). */
  width: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Rend son contenu dans une <iframe> same-origin (about:blank) via un portail React.
 *
 * Pourquoi : les breakpoints Tailwind (sm/md/lg) réagissent à la largeur de la
 * fenêtre, pas à celle d'un conteneur. En passant par une iframe dont la largeur
 * vaut celle du device simulé, `window.innerWidth` à l'intérieur vaut la largeur
 * de l'iframe → le responsive du preview devient fidèle au rendu réel.
 *
 * Les styles (Tailwind / globals) sont copiés depuis le document parent et
 * resynchronisés en cas de HMR. La hauteur de l'iframe suit celle du contenu.
 */
export function PreviewFrame({ width, className, children }: PreviewFrameProps) {
  const [iframeEl, setIframeEl] = useState<HTMLIFrameElement | null>(null);
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (!iframeEl) return;
    const doc = iframeEl.contentDocument;
    if (!doc) return;

    const syncStyles = () => {
      doc.head
        .querySelectorAll('[data-preview-style]')
        .forEach((node) => node.remove());
      document
        .querySelectorAll('style, link[rel="stylesheet"]')
        .forEach((node) => {
          const clone = node.cloneNode(true) as HTMLElement;
          clone.setAttribute('data-preview-style', 'true');
          doc.head.appendChild(clone);
        });
      // Reprend les classes ET les variables de thème inline portées par <html>
      // (le admin-theme-provider y pose --primary/--ring via style.setProperty).
      doc.documentElement.className = document.documentElement.className;
      doc.documentElement.style.cssText = document.documentElement.style.cssText;
      doc.body.className = document.body.className;
      doc.body.style.margin = '0';
      doc.body.style.background = 'transparent';
    };

    syncStyles();
    setMountNode(doc.body);

    const headObserver = new MutationObserver(syncStyles);
    headObserver.observe(document.head, { childList: true, subtree: true });
    // Resynchronise quand le thème (couleur primaire) change sur <html>.
    const rootObserver = new MutationObserver(syncStyles);
    rootObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style', 'class'],
    });

    const resizeObserver = new ResizeObserver(() => {
      setHeight(doc.body.scrollHeight);
    });
    resizeObserver.observe(doc.body);

    return () => {
      headObserver.disconnect();
      rootObserver.disconnect();
      resizeObserver.disconnect();
    };
  }, [iframeEl]);

  return (
    <>
      <iframe
        ref={setIframeEl}
        title="preview"
        className={className}
        style={{
          width,
          height: height ? `${height}px` : '600px',
          border: 0,
          display: 'block',
        }}
      />
      {mountNode && createPortal(children, mountNode)}
    </>
  );
}
