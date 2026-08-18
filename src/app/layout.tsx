import type { Metadata } from 'next';
import './globals.css';
import GlobalChatBubble from '@/components/chat/GlobalChatBubble';

export const metadata: Metadata = {
  title: { default: 'FingenIQ — Learn. Grow. Prosper.', template: '%s — FingenIQ' },
  description: 'Institution-grade financial education platform. 44 lessons, 8 modules, 3 credential tiers, AI tutor.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <GlobalChatBubble />
      </body>
    </html>
  );
}

