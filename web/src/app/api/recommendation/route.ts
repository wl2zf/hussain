import { NextResponse } from 'next/server';
import { z } from 'zod';
import { buildRecommendation } from '@/lib/rule-engine';

const payloadSchema = z.object({
  brand: z.string().min(2),
  model: z.string().min(1),
  year: z.number().min(1980).max(new Date().getFullYear()),
  engine: z.string().min(1),
  mileage: z.number().min(0).max(700000),
  fuel: z.enum(['بنزين', 'ديزل']),
  climate: z.enum(['معتدل', 'حار', 'صحراوي']),
  drivingPattern: z.enum(['داخل المدينة', 'سفر طويل', 'أحمال ثقيلة']),
  oilConsumption: z.enum(['لا يستهلك', 'نصف لتر', 'أكثر من نصف لتر']),
  hasLeaks: z.boolean(),
  currentOil: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = payloadSchema.parse(json);

    const recommendation = buildRecommendation({
      ...parsed,
      currentOil: parsed.currentOil ?? undefined,
    });

    return NextResponse.json(recommendation);
  } catch (error) {
    console.error('recommendation error', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'بيانات غير صالحة', issues: error.issues }, { status: 422 });
    }

    return NextResponse.json({ message: 'حصل خطأ غير متوقع' }, { status: 500 });
  }
}
