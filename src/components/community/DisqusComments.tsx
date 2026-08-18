'use client';
import { useEffect, useRef } from 'react';

interface DisqusCommentsProps {
  articleSlug: string;
  articleTitle: string;
  articleUrl: string;
}

export default function DisqusComments({ articleSlug, articleTitle, articleUrl }: DisqusCommentsProps) {
  const disqusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const shortname = process.env.NEXT_PUBLIC_DISQUS_SHORTNAME;
    if (!shortname) return;

    // Set Disqus config
    (window as any).disqus_config = function (this: any) {
      this.page.url = articleUrl;
      this.page.identifier = articleSlug;
      this.page.title = articleTitle;
    };

    // Load Disqus script
    const d = document;
    const s = d.createElement('script');
    s.src = `https://${shortname}.disqus.com/embed.js`;
    s.setAttribute('data-timestamp', String(+new Date()));
    (d.head || d.body).appendChild(s);

    return () => {
      // Cleanup on unmount
      const disqusThread = document.getElementById('disqus_thread');
      if (disqusThread) disqusThread.innerHTML = '';
      // Remove script
      const scripts = document.querySelectorAll(`script[src*="${shortname}.disqus.com"]`);
      scripts.forEach(script => script.remove());
    };
  }, [articleSlug, articleTitle, articleUrl]);

  const shortname = process.env.NEXT_PUBLIC_DISQUS_SHORTNAME;
  if (!shortname) return null;

  return (
    <section style={{ marginTop: 'var(--sp-8)' }}>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-xl)', color: 'var(--ink-100)', marginBottom: 'var(--sp-6)' }}>
        Discussion
      </h2>
      <div id="disqus_thread" ref={disqusRef} />
      <noscript>
        Please enable JavaScript to view the{' '}
        <a href="https://disqus.com/?ref_noscript">comments powered by Disqus.</a>
      </noscript>
    </section>
  );
}
