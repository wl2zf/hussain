'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { vehicleDatabase } from '@/data/vehicles';
import type { RecommendationPayload } from '@/lib/rule-engine';

type FormState = {
  brand: string;
  model: string;
  year: number | '';
  engine: string;
  mileage: number | '';
  fuel: 'بنزين' | 'ديزل';
  climate: 'معتدل' | 'حار' | 'صحراوي';
  drivingPattern: 'داخل المدينة' | 'سفر طويل' | 'أحمال ثقيلة';
  oilConsumption: 'لا يستهلك' | 'نصف لتر' | 'أكثر من نصف لتر';
  hasLeaks: boolean;
  currentOil: string;
};

type RecommendationState = {
  data?: RecommendationPayload;
  error?: string;
};

const defaultForm: FormState = {
  brand: '',
  model: '',
  year: '',
  engine: '',
  mileage: '',
  fuel: 'بنزين',
  climate: 'حار',
  drivingPattern: 'داخل المدينة',
  oilConsumption: 'لا يستهلك',
  hasLeaks: false,
  currentOil: '',
};

const climates = ['معتدل', 'حار', 'صحراوي'] as const;
const drivingPatterns = ['داخل المدينة', 'سفر طويل', 'أحمال ثقيلة'] as const;
const consumptionOptions = ['لا يستهلك', 'نصف لتر', 'أكثر من نصف لتر'] as const;

const STORAGE_KEY = 'alfnia-oil-recommendation';

type CachedEntry = {
  timestamp: number;
  input: FormState;
  recommendation: RecommendationPayload;
};

export function RecommendationForm() {
  const [form, setForm] = useState<FormState>(defaultForm);
  const [result, setResult] = useState<RecommendationState>({});
  const [history, setHistory] = useState<CachedEntry[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as CachedEntry[];
      setHistory(parsed);
    } catch (error) {
      console.warn('failed to load cached recommendations', error);
    }
  }, []);

  const brands = useMemo(
    () => Array.from(new Set(vehicleDatabase.map((car) => car.brand))).sort(),
    []
  );

  const models = useMemo(() => {
    return vehicleDatabase
      .filter((car) => !form.brand || car.brand === form.brand)
      .reduce<string[]>((acc, car) => {
        if (!acc.includes(car.model)) acc.push(car.model);
        return acc;
      }, [])
      .sort();
  }, [form.brand]);

  const engines = useMemo(() => {
    return vehicleDatabase
      .filter((car) => {
        return (
          (!form.brand || car.brand === form.brand) &&
          (!form.model || car.model === form.model)
        );
      })
      .map((car) => car.engine)
      .filter((value, index, arr) => arr.indexOf(value) === index);
  }, [form.brand, form.model]);

  const years = useMemo(() => {
    const yearSet = new Set<number>();
    vehicleDatabase.forEach((car) => {
      if (
        (!form.brand || car.brand === form.brand) &&
        (!form.model || car.model === form.model) &&
        (!form.engine || car.engine === form.engine)
      ) {
        for (let year = car.yearRange[0]; year <= car.yearRange[1]; year += 1) {
          yearSet.add(year);
        }
      }
    });
    return Array.from(yearSet).sort((a, b) => b - a);
  }, [form.brand, form.model, form.engine]);

  const currentVehicle = useMemo(() => {
    if (!form.brand || !form.model || !form.engine || !form.year) return undefined;
    return vehicleDatabase.find(
      (car) =>
        car.brand === form.brand &&
        car.model === form.model &&
        car.engine === form.engine &&
        form.year >= car.yearRange[0] &&
        form.year <= car.yearRange[1]
    );
  }, [form.brand, form.model, form.engine, form.year]);

  useEffect(() => {
    if (!form.brand && brands.length > 0) {
      setForm((prev) => ({ ...prev, brand: brands[0] }));
    }
  }, [brands, form.brand]);

  useEffect(() => {
    if (form.brand && (!form.model || !models.includes(form.model)) && models.length > 0) {
      setForm((prev) => ({ ...prev, model: models[0] }));
    }
  }, [form.brand, form.model, models]);

  useEffect(() => {
    if (form.model && (!form.engine || !engines.includes(form.engine)) && engines.length > 0) {
      setForm((prev) => ({ ...prev, engine: engines[0] }));
    }
  }, [form.model, form.engine, engines]);

  useEffect(() => {
    if (form.engine && (!form.year || (typeof form.year === 'number' && !years.includes(form.year))) && years.length > 0) {
      setForm((prev) => ({ ...prev, year: years[0] }));
    }
  }, [form.engine, form.year, years]);

  const handleChange = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.year || !form.mileage) {
      setResult({ error: 'يرجى إدخال السنة والقراءة الحالية للكيلومترات.' });
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch('/api/recommendation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
          body: JSON.stringify({
            ...form,
            year: form.year,
            mileage: form.mileage,
            currentOil: form.currentOil || undefined,
          }),
        });

        if (!response.ok) {
          const message = await response.json().catch(() => ({ message: 'تعذر إنشاء التوصية' }));
          throw new Error(message.message ?? 'تعذر إنشاء التوصية');
        }

        const data = (await response.json()) as RecommendationPayload;
        setResult({ data, error: undefined });
        cacheEntry({
          input: { ...form },
          recommendation: data,
        });
      } catch (error) {
        console.error(error);
        setResult({ error: 'تعذر إنشاء التوصية. تأكد من الاتصال أو حاول لاحقًا.' });
      }
    });
  };

  const cacheEntry = (entry: Omit<CachedEntry, 'timestamp'>) => {
    if (typeof window === 'undefined') return;
    try {
      const updated: CachedEntry[] = [
        { timestamp: Date.now(), ...entry },
        ...history,
      ].slice(0, 10);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setHistory(updated);
    } catch (error) {
      console.warn('failed to persist recommendation', error);
    }
  };

  const shareOnWhatsApp = () => {
    if (!result.data) return;
    const lines = result.data.summaryLines.join('\n');
    const url = new URL('https://wa.me/');
    const text = `🚘 توصية زيت مركز الفنية\n${lines}\nالمنتجات المتاحة: ${
      result.data.productMatches.map((item) => item.name).join(', ') || '—'
    }`;
    url.searchParams.set('text', text);
    window.open(url.toString(), '_blank');
  };

  const copyToClipboard = async () => {
    if (!result.data) return;
    try {
      await navigator.clipboard.writeText(result.data.summaryLines.join('\n'));
      alert('تم نسخ التوصية إلى الحافظة.');
    } catch (error) {
      console.warn('Clipboard error', error);
    }
  };

  const saveCardAsHtml = () => {
    if (!result.data) return;
    const cardHtml = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8" /><title>توصية مركز الفنية</title></head><body style="font-family: 'Cairo', sans-serif;">
      <h1>مركز الفنية لخدمات الزيوت</h1>
      <p>${result.data.summaryLines.join('</p><p>')}</p>
      <p><strong>المنتجات المطابقة:</strong></p>
      <ul>${result.data.productMatches
        .map(
          (product) => `<li>${product.name} — ${product.matches.join('، ')}</li>`
        )
        .join('')}</ul>
    </body></html>`;
    const blob = new Blob([cardHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'alfnia-oil-recommendation.html';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">مساعد توصية زيوت المحركات</h1>
          <p className="mt-2 text-sm text-slate-600">
            أدخل بيانات السيارة والظروف التشغيلية لتحصل على توصية موثوقة مرتبطة بالمخزون الحالي.
          </p>
        </header>
        <form onSubmit={handleSubmit} className="grid gap-4">
          {currentVehicle && (
            <div className="rounded-xl border border-brand-100 bg-brand-50/60 p-4 text-xs text-brand-800">
              <p className="font-semibold text-brand-900">
                {currentVehicle.brand} {currentVehicle.model} — {currentVehicle.engine} ({
                  currentVehicle.yearRange[0]
                }
                –{currentVehicle.yearRange[1]})
              </p>
              <p className="mt-2">
                مواصفة المصنع: {currentVehicle.spec.oemSpec ?? 'غير متوفرة'} | اللزوجة الأساسية:{' '}
                {currentVehicle.spec.viscosity}
              </p>
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-1 text-sm font-medium text-slate-700">
              <span>الماركة</span>
              <select
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-300"
                value={form.brand}
                onChange={(event) => handleChange('brand', event.target.value)}
              >
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm font-medium text-slate-700">
              <span>الموديل</span>
              <select
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-300"
                value={form.model}
                onChange={(event) => handleChange('model', event.target.value)}
              >
                {models.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-1 text-sm font-medium text-slate-700">
              <span>المحرك</span>
              <select
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-300"
                value={form.engine}
                onChange={(event) => handleChange('engine', event.target.value)}
              >
                {engines.map((engine) => (
                  <option key={engine} value={engine}>
                    {engine}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm font-medium text-slate-700">
              <span>سنة الصنع</span>
              <select
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-300"
                value={form.year}
                onChange={(event) => handleChange('year', Number(event.target.value) || '')}
              >
                <option value="">اختر السنة</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-1 text-sm font-medium text-slate-700">
              <span>قراءة العداد الحالية (كم)</span>
              <input
                type="number"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-300"
                value={form.mileage}
                min={0}
                onChange={(event) => handleChange('mileage', Number(event.target.value) || '')}
              />
            </label>
            <label className="grid gap-1 text-sm font-medium text-slate-700">
              <span>نوع الوقود</span>
              <select
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-300"
                value={form.fuel}
                onChange={(event) => handleChange('fuel', event.target.value as FormState['fuel'])}
              >
                <option value="بنزين">بنزين</option>
                <option value="ديزل">ديزل</option>
              </select>
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="grid gap-1 text-sm font-medium text-slate-700">
              <span>المناخ</span>
              <select
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-300"
                value={form.climate}
                onChange={(event) => handleChange('climate', event.target.value as FormState['climate'])}
              >
                {climates.map((climate) => (
                  <option key={climate} value={climate}>
                    {climate}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm font-medium text-slate-700">
              <span>نمط القيادة</span>
              <select
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-300"
                value={form.drivingPattern}
                onChange={(event) =>
                  handleChange('drivingPattern', event.target.value as FormState['drivingPattern'])
                }
              >
                {drivingPatterns.map((pattern) => (
                  <option key={pattern} value={pattern}>
                    {pattern}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm font-medium text-slate-700">
              <span>استهلاك الزيت</span>
              <select
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-300"
                value={form.oilConsumption}
                onChange={(event) =>
                  handleChange('oilConsumption', event.target.value as FormState['oilConsumption'])
                }
              >
                {consumptionOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={form.hasLeaks}
                onChange={(event) => handleChange('hasLeaks', event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-brand-500 focus:ring-brand-400"
              />
              هل توجد تسريبات واضحة؟
            </label>
            <label className="grid gap-1 text-sm font-medium text-slate-700">
              <span>نوع الزيت الحالي (اختياري)</span>
              <input
                type="text"
                placeholder="مثال: 5W-30"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-300"
                value={form.currentOil}
                onChange={(event) => handleChange('currentOil', event.target.value)}
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-300 disabled:opacity-50"
          >
            {isPending ? 'جارٍ التحليل…' : 'احصل على التوصية'}
          </button>
        </form>
      </section>
      <section className="flex flex-col gap-4">
        <article className="flex-1 rounded-2xl bg-slate-900 p-6 text-slate-50 shadow-sm">
          <h2 className="text-xl font-semibold">التوصية</h2>
          {result.error && (
            <p className="mt-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-200">{result.error}</p>
          )}
          {result.data ? (
            <div className="mt-6 space-y-4 text-sm leading-7">
              {result.data.summaryLines.map((line, index) => (
                <p key={index} className="rounded-lg bg-slate-800/60 p-3">
                  {line}
                </p>
              ))}
              <div className="rounded-lg bg-slate-800/40 p-4">
                <h3 className="text-sm font-semibold text-brand-200">المنتجات المتوفرة</h3>
                <ul className="mt-3 space-y-2">
                  {result.data.productMatches.length ? (
                    result.data.productMatches.map((product) => (
                      <li key={product.id} className="rounded-lg bg-slate-800/50 p-3">
                        <p className="text-sm font-semibold text-white">{product.name}</p>
                        <p className="mt-1 text-xs text-slate-200">
                          {product.matches.join(' • ')}
                        </p>
                        <p className="mt-1 text-xs text-slate-300">السعر: {product.price} د.ل — المخزون: {product.stock}</p>
                      </li>
                    ))
                  ) : (
                    <li className="text-xs text-slate-300">لم يتم العثور على منتج مطابق في المخزون الحالي.</li>
                  )}
                </ul>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="rounded-lg bg-white/10 px-3 py-2 font-semibold text-white transition hover:bg-white/20"
                >
                  نسخ النص
                </button>
                <button
                  type="button"
                  onClick={shareOnWhatsApp}
                  className="rounded-lg bg-emerald-500 px-3 py-2 font-semibold text-white transition hover:bg-emerald-400"
                >
                  إرسال عبر واتساب
                </button>
                <button
                  type="button"
                  onClick={saveCardAsHtml}
                  className="rounded-lg bg-brand-500 px-3 py-2 font-semibold text-white transition hover:bg-brand-400"
                >
                  تنزيل بطاقة توصية
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-300">
              قم بإدخال بيانات السيارة لعرض التوصية التفصيلية والمنتجات المطابقة.
            </p>
          )}
        </article>
        <aside className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 className="text-sm font-semibold text-slate-800">آخر التوصيات (محفوظة أوفلاين)</h3>
          <ul className="mt-4 space-y-3 text-xs text-slate-600">
            {history.length ? (
              history.map((entry) => (
                <li key={entry.timestamp} className="rounded-lg border border-slate-200 p-3">
                  <p className="font-semibold text-slate-800">
                    {entry.input.brand} {entry.input.model} — {entry.input.engine}
                  </p>
                  <p className="mt-1 text-slate-500">
                    {new Date(entry.timestamp).toLocaleString('ar-LY')}
                  </p>
                  <button
                    type="button"
                    className="mt-2 text-brand-600 hover:text-brand-500"
                    onClick={() => setResult({ data: entry.recommendation })}
                  >
                    عرض التوصية
                  </button>
                </li>
              ))
            ) : (
              <li>سيتم حفظ آخر التوصيات هنا لاستخدامها بدون إنترنت.</li>
            )}
          </ul>
        </aside>
        <aside className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-brand-100">
          <h3 className="text-sm font-semibold text-slate-800">ملاحظات فنية</h3>
          <ul className="mt-3 list-disc space-y-2 pr-5 text-xs text-slate-600">
            <li>يعرض النظام أعلى ثلاث مطابقة من المخزون، ويمكن تعديل القواعد من لوحة التحكم لاحقًا.</li>
            <li>تسمح البطاقة القابلة للتنزيل بمشاركتها عبر الطباعة أو المراسلة وتعمل بدون اتصال إنترنت.</li>
            <li>بيانات المخزون الحالية تجريبية ويمكن ربطها بـ ERP أو Shopify لاحقًا.</li>
          </ul>
        </aside>
      </section>
    </div>
  );
}
