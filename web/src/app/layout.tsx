import type { Metadata } from 'next';
import './globals.css';
import { Cairo } from 'next/font/google';

const cairo = Cairo({ subsets: ['arabic'], variable: '--font-cairo' });

export const metadata: Metadata = {
  title: 'مساعد توصية زيوت المحركات - مركز الفنية',
  description:
    'أداة ذكية تساعد فنيي مركز الفنية على اختيار زيت المحرك المثالي حسب توصيات المصنع وظروف الاستخدام في ليبيا.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className="min-h-screen bg-slate-100 font-[family-name:var(--font-cairo)]">
        {children}
      </body>
    </html>
  );
}
