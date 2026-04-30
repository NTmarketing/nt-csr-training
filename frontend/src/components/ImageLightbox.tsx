import { X } from 'lucide-react';
import { useEffect } from 'react';

export type LightboxContent =
  | { kind: 'image'; src: string; alt: string; caption?: string }
  | { kind: 'svg'; svg: string; caption?: string };

interface Props {
  content: LightboxContent | null;
  onClose: () => void;
}

export default function ImageLightbox({ content, onClose }: Props) {
  useEffect(() => {
    if (!content) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [content, onClose]);

  if (!content) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
      >
        <X className="h-5 w-5" />
      </button>

      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-full w-full max-w-6xl flex-col items-center gap-3"
      >
        {content.kind === 'image' ? (
          <img
            src={content.src}
            alt={content.alt}
            className="max-h-[85vh] w-auto max-w-full rounded-md object-contain shadow-2xl"
          />
        ) : (
          <div
            className="max-h-[85vh] w-full overflow-auto rounded-md bg-white p-4 shadow-2xl"
            dangerouslySetInnerHTML={{ __html: content.svg }}
          />
        )}
        {content.caption && (
          <div className="max-w-3xl text-center text-sm text-white/80">{content.caption}</div>
        )}
      </div>
    </div>
  );
}
