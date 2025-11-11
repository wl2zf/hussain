export type InventoryItem = {
  id: string;
  name: string;
  brand: string;
  viscosity: string;
  api: string;
  acea?: string;
  ilsac?: string;
  oemSpecs?: string[];
  stock: number;
  price: number;
  isSynthetic: boolean;
};

export const inventory: InventoryItem[] = [
  {
    id: 'total-quartz-9000-5w30',
    name: 'Total Quartz 9000 Future XT 5W-30',
    brand: 'TotalEnergies',
    viscosity: '5W-30',
    api: 'SP',
    acea: 'A5/B5',
    oemSpecs: ['Hyundai/Kia MS-5315'],
    stock: 28,
    price: 185,
    isSynthetic: true,
  },
  {
    id: 'valvoline-advanced-0w20',
    name: 'Valvoline Advanced Full Synthetic 0W-20',
    brand: 'Valvoline',
    viscosity: '0W-20',
    api: 'SP',
    ilsac: 'GF-6B',
    stock: 16,
    price: 210,
    isSynthetic: true,
  },
  {
    id: 'eni-i-sint-5w40',
    name: 'ENI i-Sint 5W-40',
    brand: 'ENI',
    viscosity: '5W-40',
    api: 'SP',
    acea: 'A3/B4',
    stock: 11,
    price: 175,
    isSynthetic: true,
  },
];
