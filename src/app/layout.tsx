import type { Metadata } from 'next';
import { Store } from '@/components/store';
import { Shell } from '@/components/shell';
import './fonts.css';
import './globals.css';
export const metadata: Metadata = {
  title: 'Property OS · Australia Investment',
  description: 'A personal property research workspace. Clearly labelled mock data.',
};
export const runtime = 'nodejs';
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Store>
          <Shell>{children}</Shell>
        </Store>
      </body>
    </html>
  );
}
