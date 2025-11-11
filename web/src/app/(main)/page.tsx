import { Metadata } from 'next';
import { RecommendationForm } from '@/components/RecommendationForm';

export const metadata: Metadata = {
  title: 'لوحة توصية الزيوت | مركز الفنية',
};

export default function Page() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12">
      <div className="flex flex-col gap-3">
        <span className="text-xs uppercase tracking-[0.3em] text-brand-500">ALFNIA SERVICE CENTER</span>
        <h1 className="text-3xl font-bold text-slate-900">التوصية الذكية لزيوت المحركات</h1>
        <p className="max-w-3xl text-sm text-slate-600">
          يعتمد هذا الإصدار الأوّلي على قاعدة بيانات مصغّرة ومحرك قواعد قابل للتوسّع لتقديم توصية عربية فورية
          متوافقة مع مواصفات المصنع ومخزون مركز الفنية. يدعم العمل دون إنترنت ويولّد بطاقة مشاركة جاهزة.
        </p>
      </div>
      <RecommendationForm />
    </main>
  );
}
