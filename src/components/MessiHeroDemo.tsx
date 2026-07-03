import { useEffect } from 'react';
import ScrollExpandMedia from '@/components/ui/scroll-expansion-hero';

export default function MessiHeroDemo() {
  useEffect(() => {
    // Reset scroll position to top when mounting
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className='min-h-screen bg-black text-white w-full rounded-2xl overflow-hidden' style={{ border: '1px solid var(--border-color)' }}>
      <ScrollExpandMedia
        mediaType='video'
        mediaSrc='/messi.mp4'
        bgImageSrc='/messi.jpeg'
        title='Lionel Messi'
        date='Football Legend'
        scrollToExpand='Scroll to Expand'
        textBlend
      >
        <div className='max-w-4xl mx-auto text-center py-10'>
          <h2 className='text-2xl md:text-4xl font-bold mb-6 text-white leading-snug'>
            Lionel Messi has conquered his final peak. Lionel Messi has shaken hands with paradise.
          </h2>

          <p className='text-lg md:text-xl leading-relaxed text-zinc-300'>
            The little boy from Rosario Santa Fe has just pitched up in heaven. The greatest of all time
          </p>
        </div>
      </ScrollExpandMedia>
    </div>
  );
}
