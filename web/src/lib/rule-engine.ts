import { inventory } from '@/data/inventory';
import { vehicleDatabase, type EngineSpecification, type VehicleRecord } from '@/data/vehicles';

type Climate = 'معتدل' | 'حار' | 'صحراوي';
type DrivingPattern = 'داخل المدينة' | 'سفر طويل' | 'أحمال ثقيلة';
type OilConsumption = 'لا يستهلك' | 'نصف لتر' | 'أكثر من نصف لتر';

type RecommendationInput = {
  brand: string;
  model: string;
  year: number;
  engine: string;
  mileage: number;
  fuel: 'بنزين' | 'ديزل';
  climate: Climate;
  drivingPattern: DrivingPattern;
  oilConsumption: OilConsumption;
  hasLeaks: boolean;
  currentOil?: string;
};

type RecommendationProduct = {
  id: string;
  name: string;
  brand: string;
  price: number;
  stock: number;
  matches: string[];
};

type RecommendationPayload = {
  vehicle?: VehicleRecord;
  spec: EngineSpecification;
  recommendedViscosity: string;
  alternativeViscosity?: string;
  summaryLines: [string, string, string];
  productMatches: RecommendationProduct[];
};

type RuleAdjustmentContext = {
  spec: EngineSpecification;
  input: RecommendationInput;
};

function resolveVehicle(input: RecommendationInput): VehicleRecord | undefined {
  return vehicleDatabase.find((vehicle) => {
    const withinYear = input.year >= vehicle.yearRange[0] && input.year <= vehicle.yearRange[1];
    return (
      withinYear &&
      vehicle.brand === input.brand &&
      vehicle.model === input.model &&
      vehicle.engine === input.engine &&
      vehicle.fuel === input.fuel
    );
  });
}

function adjustViscosity({ spec, input }: RuleAdjustmentContext): {
  recommended: string;
  alternative?: string;
  rationale: string[];
} {
  let recommended = spec.viscosity;
  let alternative = spec.alternativeViscosities?.[0];
  const rationale: string[] = [];

  const prefersThicker =
    (input.climate === 'حار' || input.climate === 'صحراوي') && spec.alternativeViscosities?.includes('5W-40');
  const hasConsumption = input.oilConsumption !== 'لا يستهلك';

  if (prefersThicker) {
    recommended = '5W-40';
    rationale.push('تم رفع اللزوجة للتعامل مع حرارة ليبيا المرتفعة.');
    if (spec.alternativeViscosities?.includes(spec.viscosity)) {
      alternative = spec.viscosity;
    }
  }

  if (!prefersThicker && hasConsumption && spec.alternativeViscosities?.includes('5W-40')) {
    alternative = '5W-40';
    rationale.push('يمكن التحول إلى 5W-40 إذا استمر النقص في الزيت.');
  }

  if (input.drivingPattern === 'أحمال ثقيلة' && spec.alternativeViscosities?.includes('5W-40')) {
    alternative = '5W-40';
    if (recommended !== '5W-40') {
      rationale.push('استخدام أحمال ثقيلة يستفيد من خيار 5W-40 كبديل.');
    }
  }

  if (!alternative && spec.alternativeViscosities && spec.alternativeViscosities.length > 0) {
    alternative = spec.alternativeViscosities[0];
  }

  return { recommended, alternative, rationale };
}

function findProducts(spec: EngineSpecification, primaryViscosity: string, alternative?: string) {
  const viscosities = new Set([primaryViscosity, alternative].filter(Boolean) as string[]);

  return inventory
    .map((item) => {
      const matches: string[] = [];

      if (viscosities.has(item.viscosity)) {
        matches.push(`اللزوجة ${item.viscosity}`);
      }

      if (item.api.toUpperCase().includes(spec.api.toUpperCase())) {
        matches.push(`API ${item.api}`);
      }

      if (spec.ilsac && item.ilsac && item.ilsac.toUpperCase().includes(spec.ilsac.toUpperCase())) {
        matches.push(`ILSAC ${item.ilsac}`);
      }

      if (spec.acea && item.acea && item.acea.toUpperCase().includes(spec.acea.toUpperCase())) {
        matches.push(`ACEA ${item.acea}`);
      }

      if (spec.oemSpec && item.oemSpecs?.some((code) => code.toUpperCase().includes(spec.oemSpec!.toUpperCase()))) {
        matches.push('مطابقة لمواصفة المصنع');
      }

      return matches.length
        ? {
            id: item.id,
            name: item.name,
            brand: item.brand,
            price: item.price,
            stock: item.stock,
            matches,
          }
        : undefined;
    })
    .filter(Boolean)
    .slice(0, 4) as RecommendationProduct[];
}

export function buildRecommendation(input: RecommendationInput): RecommendationPayload {
  const vehicle = resolveVehicle(input);

  const spec =
    vehicle?.spec ?? {
      viscosity: '5W-30',
      alternativeViscosities: ['5W-40'],
      api: 'SP',
      ilsac: 'GF-6',
      acea: 'A5/B5',
      sumpCapacityLiters: 4.5,
      oilFilter: 'استخدم فلتر أصلي أو مكافئ معتمد',
      changeIntervalKm: [6000, 8000],
    };

  const { recommended, alternative, rationale } = adjustViscosity({ spec, input });
  const products = findProducts(spec, recommended, alternative);

  const summaryLine1Parts = [`الموصى به: ${recommended} بمواصفة API ${spec.api}`];
  if (spec.ilsac) summaryLine1Parts.push(`ILSAC ${spec.ilsac}`);
  if (spec.acea) summaryLine1Parts.push(`ACEA ${spec.acea}`);
  if (alternative) summaryLine1Parts.push(`بديل: ${alternative}`);

  const specLine = vehicle?.spec.oemSpec
    ? `التزم بمواصفة ${vehicle.spec.oemSpec}; كمية الحوض التقريبية ${spec.sumpCapacityLiters.toFixed(1)} لتر مع الفلتر.`
    : `تأكد من تطابق العبوة مع المواصفات المطلوبة. السعة التقريبية ${spec.sumpCapacityLiters.toFixed(1)} لتر.`;

  const intervalLine = `غيّر كل ${spec.changeIntervalKm[0]}–${spec.changeIntervalKm[1]} كم (${input.drivingPattern.toLowerCase()}). ${
    input.oilConsumption !== 'لا يستهلك'
      ? 'راقب النقص وسمك اللزوجة البديلة عند الحاجة.'
      : 'احرص على فلتر أصلي وفحص أي تسريب محتمل.'
  }`;

  const summary: [string, string, string] = [
    summaryLine1Parts.join(' | '),
    specLine,
    intervalLine,
  ];

  if (rationale.length) {
    summary[2] += ` ${rationale.join(' ')}`;
  }

  return {
    vehicle,
    spec,
    recommendedViscosity: recommended,
    alternativeViscosity: alternative,
    summaryLines: summary,
    productMatches: products,
  };
}

export type { RecommendationInput, RecommendationPayload, RecommendationProduct };
