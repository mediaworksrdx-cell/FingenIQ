import type { Metadata, Viewport } from 'next';
import './globals.css';
import GlobalChatBubble from '@/components/chat/GlobalChatBubble';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#FAF8F5',
};

export const metadata: Metadata = {
  title: { default: 'FinGen IQ — Learn. Grow. Prosper.', template: '%s — FinGen IQ' },
  description: 'Institution-grade financial education platform. Continuous Learning. Limitless Growth. 44 lessons, 8 modules, 3 credential tiers, AI tutor.',
  icons: {
    icon: '/icon.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                window.addEventListener('error', function(e) {
                  var msg = (e && e.message) ? e.message.toLowerCase() : '';
                  if (msg.indexOf('chunk') !== -1 || msg.indexOf('failed to fetch') !== -1 || msg.indexOf('loading css') !== -1) {
                    var lastReload = sessionStorage.getItem('last_auto_reload');
                    var now = Date.now();
                    if (!lastReload || (now - parseInt(lastReload, 10)) > 5000) {
                      sessionStorage.setItem('last_auto_reload', now.toString());
                      window.location.reload();
                    }
                  }
                });
                window.addEventListener('unhandledrejection', function(e) {
                  var reason = (e && e.reason && e.reason.message) ? e.reason.message.toLowerCase() : '';
                  if (reason.indexOf('chunk') !== -1 || reason.indexOf('failed to fetch') !== -1) {
                    var lastReload = sessionStorage.getItem('last_auto_reload');
                    var now = Date.now();
                    if (!lastReload || (now - parseInt(lastReload, 10)) > 5000) {
                      sessionStorage.setItem('last_auto_reload', now.toString());
                      window.location.reload();
                    }
                  }
                });
              })();
            `,
          }}
        />
      </head>
      <body>
        {children}
        <GlobalChatBubble />
      </body>
    </html>
  );
}

