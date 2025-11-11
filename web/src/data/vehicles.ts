export type EngineSpecification = {
  oemSpec?: string;
  api: string;
  ilsac?: string;
  acea?: string;
  viscosity: string;
  alternativeViscosities?: string[];
  sumpCapacityLiters: number;
  oilFilter: string;
  changeIntervalKm: [number, number];
};

export type VehicleRecord = {
  id: string;
  brand: string;
  model: string;
  yearRange: [number, number];
  engine: string;
  fuel: 'بنزين' | 'ديزل';
  spec: EngineSpecification;
};

export const vehicleDatabase: VehicleRecord[] = [
  {
    id: 'hyundai-elantra-2012-16gdi',
    brand: 'هيونداي',
    model: 'إلانترا',
    yearRange: [2011, 2013],
    engine: '1.6 GDI',
    fuel: 'بنزين',
    spec: {
      oemSpec: 'Hyundai/Kia MS-5315',
      api: 'SP',
      ilsac: 'GF-6',
      viscosity: '5W-30',
      alternativeViscosities: ['0W-20', '5W-40'],
      acea: 'A5/B5',
      sumpCapacityLiters: 4.3,
      oilFilter: 'فلتر أصلي هيونداي أو معتمد',
      changeIntervalKm: [6000, 8000],
    },
  },
  {
    id: 'kia-sportage-2018-16tgdi',
    brand: 'كيا',
    model: 'سبورتاج',
    yearRange: [2017, 2019],
    engine: '1.6 T-GDI',
    fuel: 'بنزين',
    spec: {
      oemSpec: 'Hyundai/Kia MS-5315',
      api: 'SP',
      ilsac: 'GF-6',
      viscosity: '5W-30',
      alternativeViscosities: ['0W-30'],
      acea: 'A5/B5',
      sumpCapacityLiters: 5.7,
      oilFilter: 'فلتر توربو معتمد',
      changeIntervalKm: [5000, 7000],
    },
  },
  {
    id: 'toyota-corolla-2015-18valvematic',
    brand: 'تويوتا',
    model: 'كورولا',
    yearRange: [2014, 2016],
    engine: '1.8 Valvematic',
    fuel: 'بنزين',
    spec: {
      oemSpec: 'Toyota 0W-20 SN Plus',
      api: 'SP',
      ilsac: 'GF-6B',
      viscosity: '0W-20',
      alternativeViscosities: ['5W-30'],
      acea: 'A1/B1',
      sumpCapacityLiters: 4.2,
      oilFilter: 'فلتر Denso أو مكافئ معتمد',
      changeIntervalKm: [8000, 10000],
    },
  },
];
