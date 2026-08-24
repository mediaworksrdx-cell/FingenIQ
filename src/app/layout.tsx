import type { Metadata } from 'next';
import './globals.css';
import GlobalChatBubble from '@/components/chat/GlobalChatBubble';

export const metadata: Metadata = {
  title: { default: 'FinGen IQ — Continuous Learning. Limitless Growth.', template: '%s — FinGen IQ' },
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
      <body>
        {children}
        <GlobalChatBubble />
      </body>
    </html>
  );
}

