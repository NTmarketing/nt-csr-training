import { useState } from 'react';
import type { MediaBlock as MediaBlockType } from '../types';
import ImageLightbox, { type LightboxContent } from './ImageLightbox';
import { resolveSvg } from '../content/svgs';

interface Props {
  block: MediaBlockType;
}

export default function MediaBlock({ block }: Props) {
  const [lightbox, setLightbox] = useState<LightboxContent | null>(null);

  const openImage = (src: string, alt: string, caption?: string) =>
    setLightbox({ kind: 'image', src, alt, caption });
  const openSvg = (svg: string, caption?: string) =>
    setLightbox({ kind: 'svg', svg, caption });

  let body: React.ReactNode = null;

  if (block.type === 'image') {
    body = (
      <figure className="my-4">
        <button
          type="button"
          onClick={() => openImage(block.src, block.alt, block.caption)}
          className="group block w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
          aria-label={`View larger: ${block.alt}`}
        >
          <img
            src={block.src}
            alt={block.alt}
            loading="lazy"
            className="mx-auto max-h-[400px] w-full object-contain transition group-hover:opacity-95"
          />
        </button>
        {block.caption && (
          <figcaption className="mt-2 text-center text-xs text-gray-500">{block.caption}</figcaption>
        )}
      </figure>
    );
  } else if (block.type === 'gallery') {
    const colsClass =
      block.columns === 2
        ? 'grid-cols-2'
        : block.columns === 3
          ? 'grid-cols-2 sm:grid-cols-3'
          : 'grid-cols-2 sm:grid-cols-4';
    body = (
      <div className={`my-4 grid gap-3 ${colsClass}`}>
        {block.images.map((img, i) => (
          <figure key={i}>
            <button
              type="button"
              onClick={() => openImage(img.src, img.alt, img.caption)}
              className="group block aspect-video w-full overflow-hidden rounded-md border border-gray-200 bg-gray-50"
              aria-label={`View larger: ${img.alt}`}
            >
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                className="h-full w-full object-cover transition group-hover:scale-[1.02]"
              />
            </button>
            {img.caption && (
              <figcaption className="mt-1.5 text-xs text-gray-600">{img.caption}</figcaption>
            )}
          </figure>
        ))}
      </div>
    );
  } else if (block.type === 'comparison') {
    body = (
      <div className="my-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <ComparisonSide
          side={block.left}
          onClick={() => openImage(block.left.src, block.left.alt, block.left.label)}
        />
        <div className="hidden text-xs font-bold uppercase tracking-wider text-gray-400 sm:block">
          vs
        </div>
        <ComparisonSide
          side={block.right}
          onClick={() => openImage(block.right.src, block.right.alt, block.right.label)}
        />
      </div>
    );
  } else if (block.type === 'svg') {
    const resolved = resolveSvg(block.svg);
    if (!resolved) return null;
    body = (
      <figure className="my-4">
        <button
          type="button"
          onClick={() => openSvg(resolved, block.caption)}
          className="group block w-full max-h-[400px] overflow-auto rounded-lg border border-gray-200 bg-white p-3 text-left transition hover:border-nt-primary/40"
          aria-label="View diagram larger"
        >
          <div
            className="[&>svg]:h-auto [&>svg]:w-full"
            dangerouslySetInnerHTML={{ __html: resolved }}
          />
        </button>
        {block.caption && (
          <figcaption className="mt-2 text-center text-xs text-gray-500">{block.caption}</figcaption>
        )}
      </figure>
    );
  }

  return (
    <>
      {body}
      <ImageLightbox content={lightbox} onClose={() => setLightbox(null)} />
    </>
  );
}

function ComparisonSide({
  side,
  onClick,
}: {
  side: { src: string; alt: string; label: string };
  onClick: () => void;
}) {
  return (
    <figure>
      <div className="mb-1 text-center text-xs font-semibold uppercase tracking-wide text-gray-700">
        {side.label}
      </div>
      <button
        type="button"
        onClick={onClick}
        className="group block aspect-video w-full overflow-hidden rounded-md border border-gray-200 bg-gray-50"
        aria-label={`View larger: ${side.alt}`}
      >
        <img
          src={side.src}
          alt={side.alt}
          loading="lazy"
          className="h-full w-full object-cover transition group-hover:scale-[1.02]"
        />
      </button>
    </figure>
  );
}
