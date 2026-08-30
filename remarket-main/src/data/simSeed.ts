/**
 * Re:Market — Simulation Seed Data (riêng biệt với dữ liệu thật)
 *
 * Dùng cho APP_MODE=simulation: bộ dữ liệu giả, nhỏ gọn, rõ ràng là "DEMO",
 * KHÔNG trộn chung với dbStore thật. Khi chuyển live chạy dữ liệu thật (dbStore),
 * và toàn bộ thao tác trong simulation có thể purge mà không đụng dữ liệu thật.
 */

import { SeedData } from './seedData';
import {
  ProductItem,
  AcquisitionRecord,
  InventoryItem,
  InspectionRecord,
  OrderRecord,
  CustomerUser,
  ConditionRank,
  ProductCategory,
  UserAccount,
} from '../types';
import { hashPassword } from '../../lib/security/hash';

const DEMO_CATEGORIES: ProductCategory[] = ['カメラ', 'パソコン', 'スマートフォン', 'ゲーム', 'オーディオ', '腕時計', '家電'];

const SIM_CATEGORY_IMAGES: Partial<Record<ProductCategory, string[]>> = {
  カメラ: [
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&w=800&q=80',
  ],
  パソコン: [
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=800&q=80',
  ],
  スマートフォン: [
    'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80',
  ],
  ゲーム: [
    'https://images.unsplash.com/photo-1486401899868-0e435ed85128?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1592840496694-26d035b52b48?auto=format&fit=crop&w=800&q=80',
  ],
  オーディオ: [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
  ],
  腕時計: [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?auto=format&fit=crop&w=800&q=80',
  ],
  家電: [
    'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
  ],
};

const DEMO_ITEMS: {
  brand: string;
  model: string;
  category: ProductCategory;
  price: number;
  cost: number;
  rank: ConditionRank;
}[] = [
  { brand: 'SIM Canon', model: 'EOS R6 (DEMO)', category: 'カメラ', price: 168000, cost: 118000, rank: 'A' },
  { brand: 'SIM Sony', model: 'α7 III (DEMO)', category: 'カメラ', price: 148000, cost: 103000, rank: 'B' },
  { brand: 'SIM Nikon', model: 'Z6 II (DEMO)', category: 'カメラ', price: 122000, cost: 84000, rank: 'B' },
  { brand: 'SIM Fujifilm', model: 'X-T4 (DEMO)', category: 'カメラ', price: 116000, cost: 79000, rank: 'A' },
  { brand: 'SIM Panasonic', model: 'LUMIX GH5 (DEMO)', category: 'カメラ', price: 98000, cost: 65000, rank: 'C' },
  { brand: 'SIM Apple', model: 'MacBook Air M2 (DEMO)', category: 'パソコン', price: 98000, cost: 66000, rank: 'A' },
  { brand: 'SIM Dell', model: 'XPS 15 (DEMO)', category: 'パソコン', price: 88000, cost: 59000, rank: 'C' },
  { brand: 'SIM Lenovo', model: 'ThinkPad X1 (DEMO)', category: 'パソコン', price: 72000, cost: 48000, rank: 'B' },
  { brand: 'SIM Apple', model: 'MacBook Pro 14 M1 (DEMO)', category: 'パソコン', price: 132000, cost: 91000, rank: 'B' },
  { brand: 'SIM Microsoft', model: 'Surface Laptop 5 (DEMO)', category: 'パソコン', price: 79000, cost: 52000, rank: 'A' },
  { brand: 'SIM Apple', model: 'iPhone 15 Pro (DEMO)', category: 'スマートフォン', price: 96000, cost: 68000, rank: 'A' },
  { brand: 'SIM Samsung', model: 'Galaxy S23 (DEMO)', category: 'スマートフォン', price: 68000, cost: 46000, rank: 'B' },
  { brand: 'SIM Google', model: 'Pixel 8 (DEMO)', category: 'スマートフォン', price: 62000, cost: 41000, rank: 'B' },
  { brand: 'SIM Sony', model: 'Xperia 1 V (DEMO)', category: 'スマートフォン', price: 84000, cost: 57000, rank: 'C' },
  { brand: 'SIM Nintendo', model: 'Switch OLED (DEMO)', category: 'ゲーム', price: 26000, cost: 18000, rank: 'A' },
  { brand: 'SIM Sony PS', model: 'PS5 (DEMO)', category: 'ゲーム', price: 44000, cost: 31000, rank: 'B' },
  { brand: 'SIM Steam', model: 'Deck 512GB (DEMO)', category: 'ゲーム', price: 39000, cost: 27000, rank: 'C' },
  { brand: 'SIM Nintendo', model: 'Switch Lite (DEMO)', category: 'ゲーム', price: 16000, cost: 10500, rank: 'B' },
  { brand: 'SIM Sony', model: 'WH-1000XM5 (DEMO)', category: 'オーディオ', price: 26000, cost: 17000, rank: 'A' },
  { brand: 'SIM Bose', model: 'QuietComfort 45 (DEMO)', category: 'オーディオ', price: 22000, cost: 14500, rank: 'B' },
  { brand: 'SIM SEIKO', model: 'Presage (DEMO)', category: '腕時計', price: 78000, cost: 52000, rank: 'B' },
  { brand: 'SIM CASIO', model: 'G-SHOCK MT-G (DEMO)', category: '腕時計', price: 64000, cost: 43000, rank: 'A' },
  { brand: 'SIM Dyson', model: 'V12 Detect Slim (DEMO)', category: '家電', price: 56000, cost: 37000, rank: 'B' },
  { brand: 'SIM BALMUDA', model: 'The Toaster (DEMO)', category: '家電', price: 21000, cost: 13000, rank: 'A' },
  { brand: 'SIM Panasonic', model: 'LUMIX 4K ビデオカメラ (DEMO)', category: 'カメラ', price: 88000, cost: 59000, rank: 'C' },
  { brand: 'SIM Canon', model: 'PowerShot G7X (DEMO)', category: 'カメラ', price: 52000, cost: 34000, rank: 'B' },
  { brand: 'SIM Apple', model: 'iPad Pro 11 M2 (DEMO)', category: 'パソコン', price: 88000, cost: 59000, rank: 'B' },
  { brand: 'SIM Apple', model: 'iPhone 13 (DEMO)', category: 'スマートフォン', price: 52000, cost: 34000, rank: 'A' },
  { brand: 'SIM Audio-Technica', model: 'ATH-M50x (DEMO)', category: 'オーディオ', price: 15000, cost: 9500, rank: 'B' },
  { brand: 'SIM Sennheiser', model: 'HD 600 (DEMO)', category: 'オーディオ', price: 28000, cost: 18500, rank: 'A' },
  { brand: 'SIM Grand Seiko', model: 'SBGA211 (DEMO)', category: '腕時計', price: 480000, cost: 340000, rank: 'C' },
  { brand: 'SIM CITIZEN', model: 'Attesa (DEMO)', category: '腕時計', price: 96000, cost: 66000, rank: 'B' },
  { brand: 'SIM iRobot', model: 'Roomba i7+ (DEMO)', category: '家電', price: 42000, cost: 28000, rank: 'B' },
  { brand: 'SIM SHARP', model: '無水調理 ヘルシオ (DEMO)', category: '家電', price: 68000, cost: 47000, rank: 'C' },
];

export function generateSimulationSeed(): SeedData {
  const today = '2026-08-30';
  const products: ProductItem[] = [];
  const acquisitions: AcquisitionRecord[] = [];
  const inventories: InventoryItem[] = [];
  const inspections: InspectionRecord[] = [];
  const orders: OrderRecord[] = [];

  DEMO_ITEMS.forEach((item, i) => {
    const idx = String(i + 1).padStart(4, '0');
    const isSold = i % 4 === 0;
    const catImages = SIM_CATEGORY_IMAGES[item.category] || SIM_CATEGORY_IMAGES['カメラ'];
    const productImages = [catImages[i % catImages.length], catImages[(i + 1) % catImages.length]];
    const acq: AcquisitionRecord = {
      id: `SIM-ACQ-${idx}`,
      customerName: `デモ顧客 ${i + 1}`,
      customerPhone: '03-0000-0000',
      customerEmail: `demo${i + 1}@example.com`,
      acquiredAt: today,
      category: item.category,
      brand: item.brand,
      model: item.model,
      serialNumber: `SIM-SN-${1000 + i}`,
      purchasePrice: item.cost,
      estimatedMarketPrice: Math.round(item.price * 1.3),
      initialCondition: item.rank,
      status: '販売中',
      images: productImages,
    };
    const insp: InspectionRecord = {
      id: `SIM-INSP-${idx}`,
      acquisitionId: acq.id,
      inspectorName: 'デモ検品担当',
      inspectedAt: today,
      exterior: { scratches: '微小', dirt: 'なし', dents: 'なし', discoloration: 'なし', damage: 'なし' },
      functions: {
        power: '良好',
        display: 'ドット抜けなし・発色良好',
        buttons: '全ボタン正常動作',
        battery: '通常劣化(70-84%)',
        connectivity: 'Wi-Fi/Bluetooth/端子正常',
        mainFunctions: '全機能正常確認済',
      },
      includedAccessories: ['付属品一式（デモ）'],
      missingAccessories: [],
      defects: ['シミュレーションデータのみ'],
      cosmeticDescription: `【デモ】${item.rank}ランクのシナリオデータです。`,
      functionalDescription: '【デモ】全機能確認済みのシナリオデータです。',
      result: 'Pass',
      assignedRank: item.rank,
      staffComments: 'SIMULATION MODE のみに存在するデータ',
    };
    const inv: InventoryItem = {
      id: `SIM-INV-${idx}`,
      acquisitionId: acq.id,
      productId: `SIM-PROD-${idx}`,
      serialNumber: acq.serialNumber,
      acquisitionCost: item.cost,
      currentSellingPrice: item.price,
      grossProfit: item.price - item.cost,
      grossMarginPercent: Number((((item.price - item.cost) / item.price) * 100).toFixed(1)),
      warehouseLocation: 'SIM-センタ 00-00',
      status: '出品中',
      conditionRank: item.rank,
      acquiredAt: today,
      listedAt: today,
      history: [{ date: today, status: '出品中', note: '【デモ】シミュレーション登録', actor: 'システム' }],
    };
    const prod: ProductItem = {
      id: `SIM-PROD-${idx}`,
      inventoryId: inv.id,
      acquisitionId: acq.id,
      name: `${item.brand} ${item.model}`,
      brand: item.brand,
      model: item.model,
      category: item.category,
      serialNumber: acq.serialNumber,
      price: item.price,
      originalRetailPrice: item.price * 2,
      conditionRank: item.rank,
      stock: isSold ? 0 : 1,
      isSold,
      images: productImages,
      featuredImage: productImages[0],
      cosmeticSummary: `【デモ】${item.rank}ランクシナリオ`,
      functionalSummary: '【デモ】全機能正常',
      includedAccessories: ['付属品一式（デモ）'],
      missingAccessories: [],
      defects: ['シミュレーション'],
      inspectionDate: today,
      inspectorName: 'デモ検品担当',
      description: '【SIMULATION DEMO】これはシミュレーションモード専用のデモ商品データです。ライブモードでは表示されません。',
      keywords: [item.brand, item.model, item.category, 'デモ'],
      warrantyMonths: 3,
      shippingTime: '即日発送',
      location: 'SIM-センタ 00-00',
      viewCount: 5,
      createdAt: today,
      tags: ['デモ', 'SIM'],
    };

    products.push(prod);
    acquisitions.push(acq);
    inventories.push(inv);
    inspections.push(insp);

    // Một vài order đã "bán" cho thấy funell
    if (isSold) {
      orders.push({
        id: `SIM-ORD-${idx}`,
        customerName: `デモ顧客 ${(i % 4) + 1}`,
        customerEmail: `demo${(i % 4) + 1}@example.com`,
        customerPhone: '090',
        shippingPostalCode: '100-0001',
        shippingAddress: '東京都 千代田区 デモ 1-1',
        deliverySlot: '午前中',
        paymentMethod: 'クレジットカード',
        paymentStatus: '支払済',
        orderStatus: i % 8 === 0 ? '発送準備中' : '配達完了',
        items: [
          {
            productId: prod.id,
            productName: prod.name,
            brand: prod.brand,
            price: prod.price,
            conditionRank: prod.conditionRank,
            image: prod.featuredImage,
            serialNumber: prod.serialNumber,
          },
        ],
        subtotal: prod.price,
        tax: Math.round(prod.price * 0.1),
        shippingFee: 0,
        totalAmount: prod.price + Math.round(prod.price * 0.1),
        orderedAt: today,
        trackingNumber: `DEMO-TRK-${String(i + 1).padStart(4, '0')}`,
        isSimulation: true,
      });
    }
  });

  const customerUsers: CustomerUser[] = [
    {
      id: 'CUST-0001',
      name: '田中 デモ',
      email: 'customer@remarket.jp',
      phone: '090-0000-0000',
      postalCode: '150-0001',
      address: '東京都渋谷区',
      favorites: [products[0].id, products[1].id],
    },
    {
      id: 'CUST-0002',
      name: '佐々木 デモ',
      email: 'demo2@example.com',
      phone: '080-0000-0000',
      postalCode: '101-0002',
      address: '東京都千代田区',
      favorites: [products[4].id, products[9].id],
    },
    {
      id: 'CUST-0003',
      name: '高橋 デモ',
      email: 'demo3@example.com',
      phone: '070-0000-0000',
      postalCode: '160-0003',
      address: '東京都新宿区',
      favorites: [products[12].id],
    },
    {
      id: 'CUST-0004',
      name: '伊藤 デモ',
      email: 'demo4@example.com',
      phone: '090-0000-0004',
      postalCode: '150-0004',
      address: '東京都渋谷区',
      favorites: [products[17].id, products[20].id],
    },
  ];

  const users: UserAccount[] = [
    {
      id: 'USR-CUST-0001',
      email: 'customer@remarket.jp',
      passwordHash: hashPassword('customer123'),
      role: 'customer',
      name: '田中 デモ',
      customerId: 'CUST-0001',
    },
    {
      id: 'USR-STAFF-0001',
      email: 'staff@remarket.jp',
      passwordHash: hashPassword('staff123'),
      role: 'staff',
      name: '佐藤 検品主任',
      department: '検品・出品課',
    },
    {
      id: 'USR-ADMIN-0001',
      email: 'admin@remarket.jp',
      passwordHash: hashPassword('admin123'),
      role: 'admin',
      name: '山田 統括',
      department: '経営管理部',
    },
  ];

  return {
    products,
    acquisitions,
    inventories,
    inspections,
    orders,
    customerUsers,
    users,
  };
}
